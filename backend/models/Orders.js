const mongoose = require("mongoose");

const TOTAL_TABLES = 6;

const OrderItemSchema = new mongoose.Schema(
{
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

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

const OrderSchema = new mongoose.Schema(
{
  tableNumber: {
    type: Number,
    required: true,
    min: 1,
    max: TOTAL_TABLES,
    index: true
  },

  orderType: {
    type: String,
    enum: ["dine-in", "takeaway"],
    default: "dine-in"
  },

  items: {
    type: [OrderItemSchema],
    validate: {
      validator: v => v.length > 0,
      message: "Order must contain at least one item"
    }
  },

  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },

  status: {
    type: String,
    enum: ["active", "billed"],
    default: "active",
    index: true
  }

},
{ timestamps: true }
);
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", OrderSchema);