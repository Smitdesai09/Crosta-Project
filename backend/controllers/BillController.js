const mongoose = require("mongoose");
const Bill = require("../models/Bill");
const Order = require("../models/Order");

exports.createBill = async (req, res) => {
    try {
        const { orderId, tableNumber, items, discount = 0, gst = 0.05, paymentType, customerPhone } = req.body;

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId))
            return res.status(400).json({ success: false, message: "Invalid orderId" });

        const order = await Order.findById(orderId);
        if (!order)
            return res.status(404).json({ success: false, message: "Order not found" });

        if (order.status === "billed")
            return res.status(400).json({ success: false, message: "Order already billed" });

        if (tableNumber === undefined || tableNumber < 1 || tableNumber > 6)
            return res.status(400).json({ success: false, message: "Table number must be between 1 and 6" });

        if (!items || !Array.isArray(items) || items.length === 0)
            return res.status(400).json({ success: false, message: "Bill must have at least one item" });

        let subtotal = 0;
        const billItems = [];

        for (const item of items) {
            if (!item.name) return res.status(400).json({ success: false, message: "Item name required" });
            if (!item.variant) return res.status(400).json({ success: false, message: "Item variant required" });
            if (!item.quantity || item.quantity <= 0)
                return res.status(400).json({ success: false, message: "Item quantity must be > 0" });
            if (!item.price || item.price < 0)
                return res.status(400).json({ success: false, message: "Item price invalid" });

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

        // Explicit parentheses for secure calculation
        const totalAmount = subtotal - discount + (subtotal * gst);

        if (!["cash", "upi", "card"].includes(paymentType))
            return res.status(400).json({ success: false, message: "Invalid payment type" });

        const bill = await Bill.create({
            orderId,
            tableNumber,
            items: billItems,
            subtotal,
            discount,
            gst: subtotal * gst,
            totalAmount,
            paymentType,
            customerPhone
        });

        order.status = "billed";
        await order.save();

        return res.status(201).json({
            success: true,
            message: "Bill created successfully",
            data: bill
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getAllBills = async (req, res) => {
    try {
        const bills = await Bill.find({}, { tableNumber: 1, totalAmount: 1, paymentType: 1, items: 1, createdAt: 1 })
            .sort({ createdAt: -1 });

        // Map to summary
        const summary = bills.map(bill => ({
            billId: bill._id,
            tableNumber: bill.tableNumber,
            itemsCount: bill.items.reduce((sum, i) => sum + i.quantity, 0),
            totalAmount: bill.totalAmount,
            paymentType: bill.paymentType,
            date: bill.createdAt
        }));

        return res.status(200).json({
            success: true,
            message: "Bills fetched successfully",
            data: summary
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getBillById = async (req, res) => {
    try {
        const { billId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(billId))
            return res.status(400).json({ success: false, message: "Invalid billId" });

        const bill = await Bill.findById(billId);

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