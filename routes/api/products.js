const express= require("express")
const router = express.Router()
const productDataLayer=require("../../dal/products")


router.get("/", async (req, res)=>{
    const allProducts =  await productDataLayer.getAllProducts()
    res.json({
        "products":allProducts.toJSON()
    })
})

module.exports= router;