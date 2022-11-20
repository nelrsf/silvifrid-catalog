const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const authGuard = require("./../guards/authGuard");

router.post("/", authGuard , async (req, res) => {
  try {
    let body = "";
    req.on("data", (chunk)=>{
        body += chunk;
    });
    req.on("end", async ()=>{
        let jsonBody = JSON.parse(body);
        await Product.create(jsonBody);
        res.status(201).send("Ok");
    });

  } catch(error) {
    res.json({ message: error });
  }
});


module.exports = router;
