const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        variant: {
            type: String,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        }

    },
    { _id: false }
);

const billSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true
        },

        tableNumber: {
            type: Number,
            required: true,
            min: 1,
            max: 6
        },

        orderType: {
            type: String,
            enum: ["dine-in", "takeaway"],
            default: "dine-in",
            index: true
        },

        items: {
            type: [billItemSchema],
            validate: {
                validator: v => v.length > 0,
                message: "Bill must contain at least one item"
            }
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        },

        discount: {
            type: Number,
            default: 0,
            min: 0
        },

        gst: {
            type: Number,
            required: true,
            min: 0
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentType: {
            type: String,
            enum: ["cash", "upi", "card"],
            required: true,
            index: true
        },

        customerPhone: {
            type: String,
            trim: true,
            index: true
        },

        operatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        operatorName: {
            type: String,
            required: true,
            index: true
        }

    },
    { timestamps: true }
);
billSchema.index({ orderId: -1 });

module.exports = mongoose.model("Bill", billSchema);