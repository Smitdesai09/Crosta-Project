const express = require("express");
const router = express.Router();

const {
    createProduct,
    getAllProducts,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const { isAuthenticated, authorizeRoles } = require("../middlewares/authMiddleware");

router.get("/", isAuthenticated , getAllProducts);
router.post("/", isAuthenticated, authorizeRoles("admin"), createProduct);
router.put("/:id", isAuthenticated, authorizeRoles("admin"), updateProduct);
router.delete("/:id", isAuthenticated, authorizeRoles("admin"), deleteProduct);

module.exports = router;