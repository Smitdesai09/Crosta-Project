const express = require("express");
const router = express.Router();

const { getSummary } = require("../controllers/DashboardController");

const { isAuthenticated } = require("../middlewares/AuthMiddleware");

router.get("/", isAuthenticated, getSummary);

module.exports = router;