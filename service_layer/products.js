const productDataLayer = require("../dal/products")

//Return all products from DAL layer
async function getProducts() {
    return await productDataLayer.getAllProducts()
}

// The product price must be positive
function mustbePositive(productCost){
    if (productCost >= 0) {
        next()
    } else {
        throw "Product cost must be positive!"
    }
}


module.exports = { getProducts, mustbePositive }