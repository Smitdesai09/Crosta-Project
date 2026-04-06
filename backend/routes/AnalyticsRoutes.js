const express = require("express");
const router = express.Router();

const { getMonthlyAnalytics } = require("../controllers/AnalyticsController");

router.get("/monthly", getMonthlyAnalytics);

module.exports = router;