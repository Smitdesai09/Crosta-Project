const express = require("express");
const router = express.Router();

const { getMonthlyAnalytics } = require("../controllers/analyticsController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/authMiddleware");

router.get("/", isAuthenticated, authorizeRoles("admin"), getMonthlyAnalytics);

module.exports = router;