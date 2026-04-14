const mongoose = require("mongoose");
const Bill = require("../models/bills");
const Order = require("../models/orders");
const PDFDocument = require("pdfkit");

exports.createBill = async (req, res) => {
    try {
        const { orderId, discount = 0, gst = 0.05, paymentType, customerPhone } = req.body;

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId))
            return res.status(400).json({ success: false, message: "Invalid orderId" });

        const order = await Order.findById(orderId).select("tableNumber items status orderType").lean();

        if (!order)
            return res.status(404).json({ success: false, message: "Order not found" });

        if (order.status === "billed")
            return res.status(400).json({ success: false, message: "Order already billed" });

        const { tableNumber, items, orderType } = order;

        let subtotal = 0;
        const billItems = [];

        for (const item of items) {
            const itemSubtotal = item.price * item.quantity;
            subtotal += itemSubtotal;

            billItems.push({
                name: item.name,
                variant: item.variant,
                price: item.price,
                quantity: item.quantity,
                subtotal: itemSubtotal
            });
        }

        const taxableAmount = subtotal - discount;
        const gstAmount = Number((taxableAmount * gst).toFixed(2));
        const totalAmount = Number((taxableAmount + gstAmount).toFixed(2));

        if (!["cash", "upi", "card"].includes(paymentType))
            return res.status(400).json({ success: false, message: "Invalid payment type" });

        // FIX: Safely get operator name (fallback to 'Unknown' if field doesn't exist on req.user)
        const operatorName = req.user.name || req.user.username || "Unknown Operator";

        const bill = await Bill.create({
            orderId,
            tableNumber,
            orderType,
            items: billItems,
            subtotal,
            discount,
            gst: gstAmount,
            totalAmount,
            paymentType,
            customerPhone,
            operatorId: req.user._id,
            operatorName: operatorName
        });

        // Update order status
        await Order.findByIdAndUpdate(orderId, { status: "billed" });

        return res.status(201).json({
            success: true,
            message: "Bill created successfully",
            data: bill
        });

    } catch (error) {
        // TEMPORARY: Log real error so you can see it in your Node terminal
        console.error("BILL CREATION ERROR:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getAllBills = async (req, res) => {
    try {

        let {
            page = 1,
            limit = 10,
            search,
            paymentType,
            orderType,
            month,
            year
        } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        const query = {};

        // SEARCH
        if (search) {
            query.$or = [
                { customerPhone: { $regex: search, $options: "i" } },
                { "items.name": { $regex: search, $options: "i" } },
                { "items.category": { $regex: search, $options: "i" } },
                { operatorName: { $regex: search, $options: "i" } }
            ];
        }

        // PAYMENT FILTER
        if (paymentType) {
            query.paymentType = paymentType;
        }

        // ORDER TYPE FILTER
        if (orderType) {
            query.orderType = orderType;
        }

        // MONTH-YEAR FILTER
        if (month && year) {

            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 1);

            query.createdAt = {
                $gte: startDate,
                $lt: endDate
            };
        }

        const total = await Bill.countDocuments(query);

        const bills = await Bill.find(
            query,
            {
                totalAmount: 1,
                paymentType: 1,
                orderType: 1,
                customerPhone: 1,
                operatorName: 1,
                createdAt: 1
            }
        )
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const summary = bills.map(bill => ({
            billId: bill._id,
            totalAmount: bill.totalAmount,
            paymentType: bill.paymentType,
            orderType: bill.orderType,
            customerPhone: bill.customerPhone,
            operatorName: bill.operatorName, // <-- ADD THIS
            date: bill.createdAt
        }));

        return res.status(200).json({
            success: true,
            message: "Bills fetched successfully",
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: summary
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
};

exports.getAvailableBillYears = async (req, res) => {
    try {
        const bills = await Bill.find({}, { createdAt: 1, _id: 0 })
            .sort({ createdAt: -1 })
            .lean();

        const uniqueYears = [];
        const seenYears = new Set();

        for (const bill of bills) {
            if (!bill.createdAt) continue;

            // Shift UTC timestamp to IST before reading the year so year boundaries stay correct.
            const istDate = new Date(new Date(bill.createdAt).getTime() + (5.5 * 60 * 60 * 1000));
            const year = istDate.getUTCFullYear();

            if (!seenYears.has(year)) {
                seenYears.add(year);
                uniqueYears.push(year);
            }
        }

        uniqueYears.sort((a, b) => b - a);

        return res.status(200).json({
            success: true,
            message: "Available bill years fetched successfully",
            data: uniqueYears
        });
    } catch (error) {
        console.error("AVAILABLE BILL YEARS ERROR:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch available bill years"
        });
    }
};

exports.getBillById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ success: false, message: "Invalid billId" });

        const bill = await Bill.findById(id).lean();

        if (!bill)
            return res.status(404).json({ success: false, message: "Bill not found" });

        return res.status(200).json({
            success: true,
            message: "Bill fetched successfully",
            data: bill
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.generatePdf = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid bill ID" });
        }

        const bill = await Bill.findById(id).lean();
        if (!bill) {
            return res.status(404).json({ success: false, message: "Bill not found" });
        }

        const fileName = `Invoice_${bill._id.toString().slice(-5)}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

        // Generous margins so it doesn't look tiny/cramped
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 60, bottom: 60, left: 60, right: 60 }
        });
        doc.pipe(res);

        const leftX = 60;
        const rightX = doc.page.width - 60;
        const contentWidth = rightX - leftX;

        // Format date: "11/4/26 1:25 PM"
        const dateObj = new Date(bill.createdAt);
        const minimalDate = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric', year: '2-digit' });
        const minimalTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const dateTimeStr = `${minimalDate} ${minimalTime}`;

        let y = doc.y;

        // --- 1. HEADER ---
        doc.font('Courier-Bold').fontSize(20).fillColor('#000')
            .text('Crosta by PD²', leftX, y, { width: contentWidth, align: 'center' });
        y = doc.y + 2;

        // GSTIN
        doc.font('Courier').fontSize(10).fillColor('#555')
            .text('GSTIN: 24CPUPD4122D1Z8', leftX, y, { width: contentWidth, align: 'center' });
        y = doc.y + 15;

        // Date & Order Type
        doc.font('Courier').fontSize(11).fillColor('#000')
            .text(`${dateTimeStr} | ${bill.orderType.toUpperCase()}`, leftX, y, { width: contentWidth, align: 'center' });
        y = doc.y + 20;

        // Top Line
        doc.moveTo(leftX, y).lineTo(rightX, y).strokeColor('#000').lineWidth(1).stroke();
        y += 10;

        // --- 2. TABLE HEADERS ---
        doc.font('Courier-Bold').fontSize(12).fillColor('#000');
        doc.text('Item', leftX, y, { width: contentWidth - 100 });
        doc.text('Amount', leftX + contentWidth - 100, y, { width: 100, align: 'right' });
        y = doc.y + 2;

        doc.moveTo(leftX, y).lineTo(rightX, y).lineWidth(0.5).stroke();
        y += 8;

        // --- 3. ITEMS ---
        doc.font('Courier').fontSize(12).fillColor('#000');
        bill.items.forEach(item => {
            const itemStr = `${item.quantity}x ${item.name} (${item.variant})`;
            const amtStr = `${item.subtotal.toFixed(2)}`;

            const amountX = leftX + contentWidth - 90;
            const itemWidth = amountX - leftX - 10;

            // Calculate height in case of long names
            const itemHeight = doc.heightOfString(itemStr, { width: itemWidth });

            doc.text(itemStr, leftX, y, { width: itemWidth });
            // Pin amount to the top right of the row
            doc.text(amtStr, amountX, y, { width: 100, align: 'right' });

            y += itemHeight + 6;
        });

        // Bottom Line
        doc.moveTo(leftX, y).lineTo(rightX, y).lineWidth(1).stroke();
        y += 10;

        // --- 4. TOTALS ---
        const totalsAmountX = leftX + contentWidth - 90;
        const totalsLabelWidth = totalsAmountX - leftX - 10;

        const drawTotalLine = (label, value, isBold = false, isRed = false) => {
            doc.font(isBold ? "Courier-Bold" : "Courier").fontSize(12);
            doc.fillColor(isRed ? "red" : "#000");
            doc.text(label, leftX, y, { width: totalsLabelWidth });
            doc.text(value, totalsAmountX, y, { width: 100, align: 'right' });
            y += 16;
        };

        drawTotalLine("Subtotal", `${bill.subtotal.toFixed(2)}`);

        if (bill.discount > 0) {
            drawTotalLine("Discount", `- ${bill.discount.toFixed(2)}`, false, true);
        }

        drawTotalLine("GST", `+ ${bill.gst.toFixed(2)}`);

        // Grand Total Line
        doc.moveTo(leftX, y).lineTo(rightX, y).lineWidth(2).stroke();
        y += 5;

        doc.font("Courier-Bold").fontSize(16).fillColor('#000');
        doc.text("TOTAL", leftX, y, { width: totalsLabelWidth });
        doc.text(`${bill.totalAmount.toFixed(2)}`, totalsAmountX, y, { width: 90, align: 'right' });
        y += 30;

        // --- 5. FOOTER ---
        doc.font("Courier").fontSize(11).fillColor('#000');
        doc.text(`Payment: ${bill.paymentType.toUpperCase()}`, leftX, y, { width: contentWidth, align: 'left' });
        y += 60;

        doc.font("Courier").fontSize(12).fillColor('#555');
        doc.text("Thank You, Visit Again", leftX, y, { width: contentWidth, align: 'center' });

        doc.end();

    } catch (error) {
        console.error("PDF GENERATION ERROR:", error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Error generating PDF" });
        }
    }
};
