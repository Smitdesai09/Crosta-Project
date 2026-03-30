const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getMe,
    getAllUsers,
    getOneUser,
    updateUser,
    deleteUser
} =require("../controllers/userController");

const {isAuthenticated} = require("../middlewares/authMiddleware");

router.post("/register",isAuthenticated,registerUser);
router.post("/login",loginUser);
router.get("/me",isAuthenticated,getMe);
router.get("/all",isAuthenticated,getAllUsers);
router.get("/:id",isAuthenticated,getOneUser);
router.put("/update/:id",isAuthenticated,updateUser);
router.delete("/delete/:id",isAuthenticated,deleteUser);


module.exports = router;