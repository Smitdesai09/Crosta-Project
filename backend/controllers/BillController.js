const mongoose = require("mongoose");
const Bill = require("../models/bills");
const Order = require("../models/orders");

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