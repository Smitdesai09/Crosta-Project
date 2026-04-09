const express = require("express");
const router = express.Router();

const {
    getAllProductsAdmin,
    getAvailableProducts,
    getProductStats,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct
} = require("../controllers/productController");

const { isAuthenticated, authorizeRoles } = require("../middlewares/authMiddleware");

router.get("/admin", isAuthenticated, authorizeRoles("admin") , getAllProductsAdmin);
router.get("/stats", isAuthenticated, getProductStats);
router.get("/",isAuthenticated, getAvailableProducts);
router.post("/", isAuthenticated, authorizeRoles("admin"), createProduct);
router.put("/:id", isAuthenticated, authorizeRoles("admin"), updateProduct);
router.delete("/:id", isAuthenticated, authorizeRoles("admin"), deleteProduct);
router.put("/:id/restore",isAuthenticated, authorizeRoles("admin"), restoreProduct);
module.exports = router;
