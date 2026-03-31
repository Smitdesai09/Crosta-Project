const express = require("express");
const router = express.Router();

const {
  createBill,
  getBills,
  getBillById
} = require("../controllers/BillController");


// Create bill 
router.post("/", createBill);
// Get all bills (history)
router.get("/", getBills);
// Get single bill
router.get("/:id", getBillById);

module.exports = router;