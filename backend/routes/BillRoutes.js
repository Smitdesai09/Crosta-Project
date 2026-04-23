const express = require("express");
const router = express.Router();

const {
  createBill,
  getAllBills,
  getAvailableBillYears,
  getBillById,
  generatePdf
} = require("../controllers/BillController");

const { isAuthenticated } = require("../middlewares/AuthMiddleware");

// Create bill 
router.post("/", isAuthenticated, createBill);
// Get available bill years
router.get("/years", isAuthenticated, getAvailableBillYears);
// Get all bills (history)
router.get("/", isAuthenticated, getAllBills);
// Generate PDF for a bill
router.get("/pdf/download/:id", generatePdf);
// Get single bill
router.get("/:id", isAuthenticated, getBillById);

module.exports = router;
