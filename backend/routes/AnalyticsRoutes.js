const express = require("express");
const router = express.Router();

const { getMonthlyAnalytics, downloadAnalyticsReport } = require("../controllers/AnalyticsController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/AuthMiddleware");

router.get("/export", isAuthenticated, authorizeRoles("admin"), downloadAnalyticsReport);
router.get("/", isAuthenticated, authorizeRoles("admin"), getMonthlyAnalytics);

module.exports = router;
