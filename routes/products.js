const express = require("express")
const router = express.Router();


// import the Product model
const {Product} = require("../models");

router.get("/", async (req, res)=>{
    let products = await Product.collection().fetch();
    res.render("products/index", {
        "products": products.toJSON()
    })
})

module.exports = router