const express = require("express");
const Asset = require("../model/asset");
const router = express.Router();


router.get("/", async (req, res)=>{
    try{
        const assetsSaved = await Asset.find({});
        res.json(assetsSaved);
    }catch(error){
        res.json({message: error})
    }
})


router.get("/:id", async (req, res)=>{
    try{
        const assetSaved = await Asset.findById(req.params.id);
        res.json(assetSaved);
    }catch(error){
        res.json({message: error})
    }
})

module.exports = router;