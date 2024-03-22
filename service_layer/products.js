const productDataLayer = require("../dal/products")

//Return all products from DAL layer
async function getProducts() {
    return await productDataLayer.getAllProducts()
}

// Product pricing must be postive
async function mustBePositive(product){
    if (product.cost < 0) {
        req.flash("error_messages", "Product cost must be more than 0")
        
    } else {
        
    }

}

// Product SKU must be unique or something
// The product price must be positive

module.exports = { getProducts }