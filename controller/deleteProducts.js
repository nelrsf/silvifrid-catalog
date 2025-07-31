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

router.delete("/:id", validateObjectId, permissionGuard(['products-delete']), async (req, res) => {
    try {
        const productId = req.params.id;

        // Find and delete the product
        const deletedProduct = await Product.findByIdAndDelete(productId);
        
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Product deleted successfully' 
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;