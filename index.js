const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv/config");
const cors = require("cors");
var bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cors())

mongoose.connect(process.env.DB_CONNECTION);


const apiGetProducts = require("./controller/getProducts");
app.use("/getproducts", apiGetProducts)

const apiCreateProducts = require("./controller/createProducts");
app.use("/createproduct", apiCreateProducts)


app.listen(process.env.PORT);