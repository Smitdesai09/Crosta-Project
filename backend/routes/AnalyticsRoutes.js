const express = require("express");
const router = express.Router();

const { getMonthlyAnalytics } = require("../controllers/AnalyticsController");

router.get("/", getMonthlyAnalytics);

module.exports = router;