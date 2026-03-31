const express = require("express");
const router = express.Router();

const { getSummary } = require("../controllers/DashboardController");

router.get("/", getSummary);

module.exports = router;