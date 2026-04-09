const mongoose = require("mongoose");
const Order = require("../models/orders");
const Product = require("../models/products");


exports.getActiveOrders = async (req, res) => {
    try {

        const orders = await Order.find(
            { status: "active" },
            { tableNumber: 1, subtotal: 1, orderType: 1, createdAt: 1 }
        )
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            message: "Active orders fetched",
            data: orders
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
};


exports.getOrderById = async (req, res) => {

    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({
                success: false,
                message: "Invalid order id"
            });

        const order = await Order.findById(id).lean();

        if (!order)
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });

        return res.status(200).json({
            success: true,
            message: "Order fetched successfully",
            data: order
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
};


exports.createOrder = async (req, res) => {

    try {

        const { tableNumber, orderType = "dine-in", items } = req.body;

        if (tableNumber === undefined || tableNumber === null)
            return res.status(400).json({
                success: false,
                message: "Table number required"
            });

        if (typeof tableNumber !== "number" || tableNumber < 1 || tableNumber > 6)
            return res.status(400).json({
                success: false,
                message: "Table number must be between 1 and 6"
            });

        const existingOrder = await Order.findOne({ tableNumber, status: "active" });

        if (existingOrder)
            return res.status(400).json({
                success: false,
                message: `Table ${tableNumber} already has an active order`
            });

        if (!items || !Array.isArray(items) || items.length === 0)
            return res.status(400).json({
                success: false,
                message: "Items required"
            });

        const productIds = [...new Set(items.map(i => i.productId))];

        const products = await Product.find(
            { _id: { $in: productIds } },
            { name: 1, variants: 1 }
        ).lean();

        const productMap = new Map(products.map(p => [p._id.toString(), p]));

        const validatedItems = [];
        let subtotal = 0;

        for (const item of items) {

            if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId))
                return res.status(400).json({ success: false, message: "Invalid productId" });

            if (!item.variant)
                return res.status(400).json({ success: false, message: "Variant required" });

            if (!item.quantity || item.quantity <= 0)
                return res.status(400).json({ success: false, message: "Quantity must be greater than 0" });

            const product = productMap.get(item.productId);

            if (!product)
                return res.status(404).json({ success: false, message: "Product not found" });

            const variant = product.variants.find(v => v.name === item.variant);

            if (!variant)
                return res.status(400).json({ success: false, message: "Invalid variant" });

            const itemSubtotal = variant.price * item.quantity;

            validatedItems.push({
                productId: product._id,
                name: product.name,
                variant: variant.name,
                price: variant.price,
                quantity: item.quantity,
                subtotal: itemSubtotal
            });

            subtotal += itemSubtotal;
        }

        const order = await Order.create({
            tableNumber,
            orderType,
            items: validatedItems,
            subtotal
        });

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
};


exports.updateOrder = async (req, res) => {

    try {

        const { id } = req.params;
        const { items, orderType } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({
                success: false,
                message: "Invalid order id"
            });

        const order = await Order.findById(id);

        if (!order)
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });

        if (order.status === "billed")
            return res.status(400).json({
                success: false,
                message: "Cannot modify billed order"
            });

        if (orderType && !["dine-in", "takeaway"].includes(orderType))
            return res.status(400).json({
                success: false,
                message: "Invalid orderType"
            });

        if (orderType) order.orderType = orderType;

        if (!items || !Array.isArray(items) || items.length === 0)
            return res.status(400).json({
                success: false,
                message: "Items required"
            });

        const productIds = [...new Set(items.map(i => i.productId))];

        const products = await Product.find(
            { _id: { $in: productIds } },
            { name: 1, variants: 1 }
        ).lean();

        const productMap = new Map(products.map(p => [p._id.toString(), p]));

        let newSubtotal = 0;
        const newItems = [];

        for (const item of items) {

            if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId))
                return res.status(400).json({ success: false, message: "Invalid productId" });

            if (!item.variant)
                return res.status(400).json({ success: false, message: "Variant required" });

            if (!item.quantity || item.quantity <= 0)
                return res.status(400).json({ success: false, message: "Quantity must be > 0" });

            const product = productMap.get(item.productId);

            if (!product)
                return res.status(404).json({ success: false, message: "Product not found" });

            const variant = product.variants.find(v => v.name === item.variant);

            if (!variant)
                return res.status(400).json({ success: false, message: "Invalid variant" });

            const itemSubtotal = variant.price * item.quantity;

            newSubtotal += itemSubtotal;

            newItems.push({
                productId: product._id,
                name: product.name,
                variant: variant.name,
                price: variant.price,
                quantity: item.quantity,
                subtotal: itemSubtotal
            });

        }

        order.items = newItems;
        order.subtotal = newSubtotal;

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order updated successfully",
            data: order
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
};


exports.cancelOrder = async (req, res) => {

    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({
                success: false,
                message: "Invalid order id"
            });

        const order = await Order.findById(id).select("status");

        if (!order)
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });

        if (order.status === "billed")
            return res.status(400).json({
                success: false,
                message: "Cannot cancel billed order"
            });

        await Order.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
};