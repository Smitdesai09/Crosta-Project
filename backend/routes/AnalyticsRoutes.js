const express = require("express");
const router = express.Router();

const { getMonthlyAnalytics } = require("../controllers/analyticsController");

router.get("/", getMonthlyAnalytics);

module.exports = router;