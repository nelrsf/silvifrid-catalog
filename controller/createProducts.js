const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const authGuard = require("./../guards/authGuard");

router.post("/", authGuard, async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        res.status(201).send("Ok");
    } catch(error) {
        res.status(500).json({ message: error.toString() });
    }
});

module.exports = router;