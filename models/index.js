const bookshelf = require("../bookshelf")

const Product = bookshelf.model("Product", {
    tableName: "products",
    category(){
        return this.belongsTo("Category")
    }
})

const Category = bookshelf.model("Category", {
    tableName: "categories",
    product(){
        return this.hasMany("Product")
    }
})

//Export the model
module.exports = {Product, Category}