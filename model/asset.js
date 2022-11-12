const mongoose = require("mongoose");

const assetSchema = mongoose.Schema({
    type: {
        type: String,
        required: true 
    },
    src: {
        type: String,
        required: true 
    },
})

module.exports = mongoose.model("asset", assetSchema);