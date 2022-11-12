const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv/config");
const cors = require("cors");


app.use(cors())

mongoose.connect(process.env.DB_CONNECTION, 
    ()=>{
           console.log("connected to db");
        }
    )


const apiProducts = require("./controller/getProducts");
app.use("/getproducts", apiProducts)

const apiAssets = require("./controller/getAssets");
app.use("/getassets", apiAssets)


app.listen(process.env.PORT);