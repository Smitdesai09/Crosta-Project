const mongoose = require("mongoose");
const Bill = require("../models/Bills");
const Order = require("../models/Orders");
const PDFDocument = require("pdfkit");

exports.createBill = async (req, res) => {
    try {

        const { orderId, discount = 0, gst = 0.05, paymentType, customerPhone } = req.body;

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId))
            return res.status(400).json({ success: false, message: "Invalid orderId" });

        if (!["cash", "upi", "card"].includes(paymentType))
            return res.status(400).json({ success: false, message: "Invalid payment type" });

        const order = await Order.findById(orderId)
            .select("orderId tableNumber items status orderType")
            .lean();

        if (!order)
            return res.status(404).json({ success: false, message: "Order not found" });

        if (order.status === "billed")
            return res.status(400).json({ success: false, message: "Order already billed" });

        let subtotal = 0;

        const billItems = order.items.map(item => {

            const itemSubtotal = item.price * item.quantity;
            subtotal += itemSubtotal;

            return {
                name: item.name,
                variant: item.variant,
                price: item.price,
                quantity: item.quantity,
                subtotal: itemSubtotal
            };

        });

        const taxableAmount = subtotal - discount;
        const gstAmount = Number((taxableAmount * gst).toFixed(2));
        const totalAmount = Number((taxableAmount + gstAmount).toFixed(2));

        const operatorName = req.user.name || req.user.username || "Unknown Operator";

        const bill = await Bill.create({
            orderRef: orderId,
            orderId: order.orderId,
            orderType: order.orderType.toLowerCase(),
            tableNumber: order.tableNumber,
            items: billItems,
            subtotal,
            discount,
            gst: gstAmount,
            totalAmount,
            paymentType,
            customerPhone,
            operatorId: req.user._id,
            operatorName
        });

        await Order.findByIdAndUpdate(orderId, { status: "billed" });

        return res.status(201).json({
            success: true,
            message: "Bill created successfully",
            data: bill
        });

    }
    catch (error) {

        console.error("BILL CREATION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
};

exports.getAllBills = async (req, res) => {
    try {

        let { page = 1, limit = 10, search, paymentType, orderType, month, year } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        const query = {};

        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: "i" } },
                { customerPhone: { $regex: search, $options: "i" } },
                { "items.name": { $regex: search, $options: "i" } },
                { operatorName: { $regex: search, $options: "i" } }
            ];
        }

        if (paymentType)
            query.paymentType = paymentType;

        if (orderType)
            query.orderType = orderType;

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
                orderId: 1,
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
            orderId: bill.orderId,
            totalAmount: bill.totalAmount,
            paymentType: bill.paymentType,
            orderType: bill.orderType,
            customerPhone: bill.customerPhone,
            operatorName: bill.operatorName,
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

    }
    catch (error) {

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

    }
    catch (error) {

        console.error("AVAILABLE BILL YEARS ERROR:", error);

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

    }
    catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
};

exports.generatePdf = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ success: false, message: "Invalid bill ID" });

        const bill = await Bill.findById(id).lean();

        if (!bill)
            return res.status(404).json({ success: false, message: "Bill not found" });

        const fileName = `Invoice_${bill._id.toString().slice(-5)}.pdf`;

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

        const doc = new PDFDocument({
            size: "A4",
            margins: { top: 60, bottom: 60, left: 60, right: 60 }
        });

        doc.pipe(res);

        const leftX = 60;
        const rightX = doc.page.width - 60;
        const width = rightX - leftX;

        const dateObj = new Date(bill.createdAt);
        const date = dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "numeric", year: "2-digit" });
        const time = dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

        let y = doc.y;

        doc.font("Courier-Bold").fontSize(20).text("Crosta by PD²", leftX, y, { width, align: "center" });

        y = doc.y + 2;

        doc.font("Courier").fontSize(10).fillColor("#555")
            .text("GSTIN: 24CPUPD4122D1Z8", leftX, y, { width, align: "center" });

        y = doc.y + 15;

        doc.font("Courier").fontSize(11).fillColor("#000")
            .text(`${date} ${time} | ${bill.orderType.toUpperCase()}`, leftX, y, { width, align: "center" });

        y = doc.y + 20;

        doc.moveTo(leftX, y).lineTo(rightX, y).stroke();
        y += 10;

        doc.font("Courier-Bold").fontSize(12);

        doc.text("Item", leftX, y, { width: width - 100 });
        doc.text("Amount", leftX + width - 100, y, { width: 100, align: "right" });

        y = doc.y + 8;

        doc.moveTo(leftX, y).lineTo(rightX, y).stroke();

        y += 8;

        doc.font("Courier").fontSize(12);

        bill.items.forEach(item => {

            const name = `${item.quantity}x ${item.name} (${item.variant})`;
            const amount = item.subtotal.toFixed(2);

            const amountX = leftX + width - 90;
            const itemWidth = amountX - leftX - 10;

            const height = doc.heightOfString(name, { width: itemWidth });

            doc.text(name, leftX, y, { width: itemWidth });
            doc.text(amount, amountX, y, { width: 100, align: "right" });

            y += height + 6;

        });

        doc.moveTo(leftX, y).lineTo(rightX, y).stroke();
        y += 10;

        const amountX = leftX + width - 90;
        const labelWidth = amountX - leftX - 10;

        const draw = (label, value, bold = false, red = false) => {

            doc.font(bold ? "Courier-Bold" : "Courier").fontSize(12);
            doc.fillColor(red ? "red" : "#000");

            doc.text(label, leftX, y, { width: labelWidth });
            doc.text(value, amountX, y, { width: 100, align: "right" });

            y += 16;

        };

        draw("Subtotal", bill.subtotal.toFixed(2));

        if (bill.discount > 0)
            draw("Discount", `- ${bill.discount.toFixed(2)}`, false, true);

        draw("GST", `+ ${bill.gst.toFixed(2)}`);

        doc.moveTo(leftX, y).lineTo(rightX, y).lineWidth(2).stroke();

        y += 5;

        doc.font("Courier-Bold").fontSize(16);

        doc.text("TOTAL", leftX, y, { width: labelWidth });
        doc.text(bill.totalAmount.toFixed(2), amountX, y, { width: 90, align: "right" });

        y += 30;

        doc.font("Courier").fontSize(11);
        doc.text(`Payment: ${bill.paymentType.toUpperCase()}`, leftX, y, { width });

        y += 60;

        doc.font("Courier").fontSize(12).fillColor("#555");
        doc.text("Thank You, Visit Again", leftX, y, { width, align: "center" });

        doc.end();

    }
    catch (error) {

        console.error("PDF GENERATION ERROR:", error);

        if (!res.headersSent)
            res.status(500).json({ success: false, message: "Error generating PDF" });

    }
};