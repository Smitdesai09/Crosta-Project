const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema(
{
    name: { type: String, required: true },
    variant: { type: String, default: null },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true }
},
{ _id: false }
);

const billSchema = new mongoose.Schema(
{
    orderRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        index: true
    },

    orderId: {
        type: String,
        required: true,
        index: true
    },

    orderType: {
        type: String,
        enum: ["dine-in", "takeaway"],
        required: true,
        index: true
    },

    tableNumber: {
        type: Number,
        default: null
    },

    items: {
        type: [billItemSchema],
        required: true
    },

    subtotal: {
        type: Number,
        required: true
    },

    discount: {
        type: Number,
        default: 0
    },

    gst: {
        type: Number,
        required: true
    },

    totalAmount: {
        type: Number,
        required: true,
        index: true
    },

    paymentType: {
        type: String,
        enum: ["cash", "upi", "card"],
        required: true,
        index: true
    },

    customerPhone: {
        type: String,
        default: null
    },

    operatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    operatorName: {
        type: String,
        required: true
    }

},
{
    timestamps: true
}
);

billSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Bill || mongoose.model("Bill", billSchema);