const express = require("express");
const router = express.Router();

const {
    getMe,
    getAllUsers,
    addUser,
    updateUser,
    deleteUser,
    restoreUser
} = require("../controllers/userController");

const {
    isAuthenticated,
    authorizeRoles
} = require("../middlewares/authMiddleware");


router.get(
    "/me", 
    isAuthenticated, 
    getMe
);

router.get(
    "/",
    isAuthenticated,
    authorizeRoles("admin"),
    getAllUsers
);

router.post(
    "/register",
    isAuthenticated,
    authorizeRoles("admin"),
    addUser
);

router.put(
    "/:id",
    isAuthenticated,
    authorizeRoles("admin"),
    updateUser
);

router.delete(
    "/:id",
    isAuthenticated,
    authorizeRoles("admin"),
    deleteUser
);

router.put(
    "/restore/:id",
    isAuthenticated,
    authorizeRoles("admin"),
    restoreUser
);

module.exports = router;
