const express = require("express");
const router = express.Router();

const {
  createOrder,
  getActiveOrders,
  getOrderById,
  updateOrder,
  cancelOrder
} = require("../controllers/orderController");


// Get all active orders (active tables)
router.get("/active", getActiveOrders);
// Get single order (order panel)
router.get("/:id", getOrderById);
// Create new order (Save KOT) 
router.post("/", createOrder);
// Update existing order (Save edited KOT)
router.patch("/:id", updateOrder);
// Cancel order
router.delete("/:id/cancel", cancelOrder);


module.exports = router;