const express = require("express")
const router = express.Router()
const productDataLayer = require("../../dal/products")


router.get("/", async (req, res) => {
    let unSortedCategoriesData = await productDataLayer.getAllCategories()
    const allCategories = unSortedCategoriesData.sort((a, b) => a[0] - b[0]);


    res.json({
        "categories": allCategories
    })
})



module.exports = router;