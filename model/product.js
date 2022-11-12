const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true 
    },
    category: {
        type: String,
        required: true 
    },
    price: {
        type: Number,
        required: true 
    },
    quantity: {
        type: Number,
        required: true 
    }
})

module.exports = mongoose.model("product", productSchema);