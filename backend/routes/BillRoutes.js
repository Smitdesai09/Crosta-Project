const express = require("express");
const router = express.Router();

const {
  createBill,
  getAllBills,
  getBillById
} = require("../controllers/billController");


// Create bill 
router.post("/", createBill);
// Get all bills (history)
router.get("/", getAllBills);
// Get single bill
router.get("/:id", getBillById);

module.exports = router;