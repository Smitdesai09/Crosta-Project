const express = require("express");
const router = express.Router();

const {
    getMe,
    getAllUsers,
    addUser,
    updateUser,
    deleteUser,
    restoreUser
} = require("../controllers/UserController");

const {
    isAuthenticated,
    authorizeRoles
} = require("../middlewares/AuthMiddleware");


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
    "/",
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
    "/:id/restore",
    isAuthenticated,
    authorizeRoles("admin"),
    restoreUser
);

module.exports = router;
