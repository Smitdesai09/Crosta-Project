const express = require("express");
const router = express.Router();

const { getSummary } = require("../controllers/dashboardController");

const {isAuthenticated} = require("../middlewares/authMiddleware");

router.get("/",isAuthenticated ,getSummary);

module.exports = router;