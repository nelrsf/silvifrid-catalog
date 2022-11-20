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


const apiGetProducts = require("./controller/getProducts");
app.use("/getproducts", apiGetProducts)

const apiCreateProducts = require("./controller/createProducts");
app.use("/createproduct", apiCreateProducts)


app.listen(process.env.PORT);