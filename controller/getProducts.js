const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const { signProducts } = require("../guards/signProduct");
const mongoose = require('mongoose');


function validateObjectId(req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid product ID format' });
    }
    next();
}


router.get("/", async (req, res) => {
    try {
        const productsSaved = await Product.find({});
        signProducts(productsSaved);
        res.status(200).json(productsSaved);
    } catch (error) {
        res.status(409).json({ message: error })
    }
})


router.get("/:id", validateObjectId, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        signProducts(product);
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;