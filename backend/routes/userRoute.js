const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getMe,
    getAllUsers,
    getOneUser,
    approveUser,
    rejectUser
} =require("../controllers/userController");

const {isAuthenticated} = require("../middlewares/authMiddleware");

router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/me",isAuthenticated,getMe);
router.get("/all",isAuthenticated,getAllUsers);
router.get("/:id",isAuthenticated,getOneUser);
router.put("/approve/:id",isAuthenticated,approveUser);
router.put("/reject/:id",isAuthenticated,rejectUser);

module.exports = router;
