const Product = require("../models/Products");
const mongoose = require("mongoose");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const normalizeVariantName = (name = "") => name.trim().toLowerCase();

const validateVariants = (variants) => {
    if (!Array.isArray(variants) || variants.length === 0) return false;
    return variants.every(v => 
        v.name && typeof v.name === 'string' && v.name.trim() &&
        v.price !== undefined && !Number.isNaN(Number(v.price)) && Number(v.price) >= 0
    );
};

const hasDuplicateVariantNames = (variants) => {
    const seen = new Set();

    for (const variant of variants) {
        const normalizedName = normalizeVariantName(variant.name);

        if (seen.has(normalizedName)) {
            return true;
        }

        seen.add(normalizedName);
    }

    return false;
};

const sanitizeVariants = (variants) =>
    variants.map((variant) => ({
        ...variant,
        name: variant.name.trim(),
        price: Number(variant.price),
    }));

exports.getAllProductsAdmin = async (req, res) => {
    try {
        const products = await Product.find()
            .sort({ isAvailable: -1, createdAt: -1 })
            .lean();
        res.status(200).json({ 
            success: true, 
            message: "All products fetched", data: products
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

exports.getAvailableProducts = async (req, res) => {
    try {
        const products = await Product.find({ isAvailable: true }).lean();

        res.status(200).json({ 
            success: true, 
            message: "Available products fetched", 
            data: products 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

exports.getProductStats = async (req, res) => {
    try {
        const [total, available] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ isAvailable: true })
        ]);

        res.status(200).json({
            success: true,
            message: "Product stats fetched",
            data: {
                total,
                available,
                unavailable: total - available
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, category, variants, isAvailable } = req.body;

        if (!name?.trim() || !category?.trim() || !variants) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required!" 
            });
        }

        if (!validateVariants(variants)) {
            return res.status(400).json({ 
                success: false, 
                message: "Variants are invalid!" 
            });
        }

        if (hasDuplicateVariantNames(variants)) {
            return res.status(400).json({
                success: false,
                message: "Duplicate variant names are not allowed for the same product!",
            });
        }

        // Only normalize to UPPERCASE
        const normalizedCategory = category.toUpperCase().trim();
        const sanitizedVariants = sanitizeVariants(variants);

        const product = await Product.create({ 
            name: name.trim(), 
            category: normalizedCategory, 
            variants: sanitizedVariants, 
            isAvailable 
        });

        res.status(201).json({ 
            success: true, 
            message: "Product added successfully!", 
            data: product 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, variants, isAvailable } = req.body;

        if (!isValidId(id)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid Product ID!" 
            });
        }

        if (!name?.trim() || !category?.trim() || !variants) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required!" 
            });
        }

        if (!validateVariants(variants)) {
            return res.status(400).json({ 
                success: false, 
                message: "Variants are invalid!" 
            });
        }

        if (hasDuplicateVariantNames(variants)) {
            return res.status(400).json({
                success: false,
                message: "Duplicate variant names are not allowed for the same product!",
            });
        }

        // Only normalize to UPPERCASE
        const normalizedCategory = category.toUpperCase().trim();
        const sanitizedVariants = sanitizeVariants(variants);

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { 
                name: name.trim(), 
                category: normalizedCategory, 
                variants: sanitizedVariants, 
                isAvailable 
            },
            { new: true }
        ).lean();

        if (!updatedProduct) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found!" 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Product updated successfully", 
            data: updatedProduct 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        if (!isValidId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Product ID!"
            });
        }

        const deletedProduct = await Product.findOneAndUpdate(
            { _id: productId, isAvailable: true },
            { isAvailable: false },
            { new: true }
        );

        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found or already unavailable!"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Product Deleted Successfully!"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.restoreProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        if (!isValidId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const restoredProduct = await Product.findOneAndUpdate(
            { _id: productId, isAvailable: false },
            { isAvailable: true },
            { new: true }
        );

        if (!restoredProduct) {
            return res.status(404).json({
                success: false,
                message: "Product Not Found or Already Active"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product Restored successfully!"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
