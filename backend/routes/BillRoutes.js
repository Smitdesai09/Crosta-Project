const express = require("express");
const router = express.Router();

const {
  createBill,
  getAllBills,
  getBillById,
  generatePdf
} = require("../controllers/billController");

const { isAuthenticated } = require("../middlewares/authMiddleware");

// Create bill 
router.post("/", isAuthenticated, createBill);
// Get all bills (history)
router.get("/", isAuthenticated, getAllBills);
// Get single bill
router.get("/:id", isAuthenticated, getBillById);
// Generate PDF for a bill
router.get("/pdf/download/:id", generatePdf);

module.exports = router;