const express = require("express");
const router = express.Router();

const {
    getMe,
    getAllUsers,
    getOneUser,
    updateUser,
    deleteUser,
    restoreUser
} = require("../controllers/userController");

const {
    isAuthenticated,
    authorizeRoles
} = require("../middlewares/authMiddleware");

router.get("/me", isAuthenticated, getMe);

router.get(
    "/",
    isAuthenticated,
    authorizeRoles("admin"),
    getAllUsers
);

router.get(
    "/:id",
    isAuthenticated,
    authorizeRoles("admin"),
    getOneUser
);

router.put(
    "/:id",
    isAuthenticated,
    authorizeRoles("admin","user"),
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
