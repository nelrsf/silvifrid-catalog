const express = require("express");
const router = express.Router();
const Product = require("../model/product");

router.get("/", async (req, res)=>{
    try{
        const productsSaved = await Product.find({});
        res.json(productsSaved);
    }catch(error){
        res.json({message: error})
    }
})


router.get("/:id", async (req, res)=>{
    try{
        const productsSaved = await Product.findById(req.params.id);
        res.json(productsSaved);
    }catch(error){
        res.json({message: error})
    }
})

module.exports = router;