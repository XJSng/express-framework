const productDataLayer = require("../dal/products")

//Return all products from DAL layer
async function getProducts() {
    return await productDataLayer.getAllProducts()
}


// Product SKU must be unique or something
// The product price must be positive

module.exports = { getProducts }