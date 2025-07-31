const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const permissionGuard = require("../guards/permissionGuard");
const mongoose = require('mongoose');

function validateObjectId(req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid product ID format' });
    }
    next();
}

router.put("/:id", validateObjectId, permissionGuard(['products-edit']), async (req, res) => {
    try {
        const productId = req.params.id;
        const updateData = req.body;

        // Find the product first to check if it exists
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update the product
        const updatedProduct = await Product.findByIdAndUpdate(
            productId, 
            updateData, 
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Update product error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;