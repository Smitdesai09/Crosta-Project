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
    orderId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: /^[DT]-[A-F0-9]{4}$/ 
    },

    orderType: {
      type: String,
      required: true,
      enum: ["dine-in", "takeaway"]
    },

    tableNumber: {
      type: Number,
      min: 1,
      max: TOTAL_TABLES,
      default: null,
      validate: {
        validator: function (value) {

          if (this.orderType === "dine-in") {
            return value !== null && value !== undefined;
          }

          if (this.orderType === "takeaway") {
            return value === null || value === undefined;
          }

          return true;
        },
        message: "tableNumber required for dine-in and must be empty for takeaway"
      }
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