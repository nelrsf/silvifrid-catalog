const crypto = require("crypto.js");
const product = require("../model/product");

const signProduct = (product) => {
    const id = product?._id?.toString();
    const name = product?._doc?.name;
    const price = product?._doc?.price;

    if (!id || !name || !price) {
        throw new Error("'Product object requires _id, name, and price properties'");
    }

    const plainSignature = id + process.env.SECRET + price + name;
    const productSignature = crypto.sha256(plainSignature);
    product._doc.signature = productSignature;
}

const signProducts = (products) => {
    if (!Array.isArray(products)) {
        signProduct(products);
    } else {
        products.forEach(
            (p) => {
                signProduct(p);
            }
        );
    }
}

module.exports = {
    signProduct,
    signProducts
}