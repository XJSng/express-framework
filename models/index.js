const bookshelf = require("../bookshelf")

const Product = bookshelf.model("Product", {
    tableName: "products",
    category(){
        return this.belongsTo("Category")
    }, tags() {
        return this.belongsToMany("Tag")
    }
})

const Category = bookshelf.model("Category", {
    tableName: "categories",
    product(){
        return this.hasMany("Product")
    }
})

const Tag = bookshelf.model("Tag", {
    tableName: "tags",
    products() {
        return this.belongsToMany("Product")
    }
})
//Export the model
module.exports = {Product, Category, Tag}