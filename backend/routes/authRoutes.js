const express = require("express");
const router = express.Router();

const {
    login,
    logout,
    forgotPassword,
    resetPassword
} = require("../controllers/AuthController");

const {
    isAuthenticated
} = require("../middlewares/AuthMiddleware");


// ROUTES
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
// router.get("/logout", isAuthenticated, logout);
router.post("/logout", isAuthenticated, logout);


module.exports = router;
