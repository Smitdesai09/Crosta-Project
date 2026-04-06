const express = require("express");
const router = express.Router();

const {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");

const {
    isAuthenticated,
    authorizeRoles
} = require("../middlewares/authMiddleware");


// 🔓 PUBLIC ROUTES
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);


// 🔐 PROTECTED ROUTES

// Admin only register
router.post(
    "/register",
    isAuthenticated,
    authorizeRoles("admin"),
    register
);

// Logout
router.get("/logout", isAuthenticated, logout);
router.post("/logout", isAuthenticated, logout);


module.exports = router;
