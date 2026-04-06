const express = require("express");
const router = express.Router();

const {
    createProduct,
    getAllProducts,
    getOneProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const {isAuthenticated,authorizeRoles} = require("../middlewares/authMiddleware");

router.post("/",isAuthenticated,authorizeRoles("admin"), createProduct);
router.get("/", getAllProducts);
router.get("/:id", getOneProduct);
router.put("/:id",isAuthenticated,authorizeRoles("admin"), updateProduct);
router.delete("/:id",isAuthenticated,authorizeRoles("admin"), deleteProduct);

module.exports = router;