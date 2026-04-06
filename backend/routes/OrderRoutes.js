const express = require("express");
const router = express.Router();

const {
  createOrder,
  getActiveOrders,
  getOrderById,
  updateOrder,
  cancelOrder
} = require("../controllers/orderController");

const { isAuthenticated } = require("../middlewares/authMiddleware");

// Get all active orders (active tables)
router.get("/active", isAuthenticated, getActiveOrders);
// Get single order (order panel)
router.get("/:id", isAuthenticated, getOrderById);
// Create new order (Save KOT) 
router.post("/", isAuthenticated, createOrder);
// Update existing order (Save edited KOT)
router.patch("/:id", isAuthenticated, updateOrder);
// Cancel order
router.delete("/:id/cancel", isAuthenticated, cancelOrder);


module.exports = router;