const express = require("express")
const router = express.Router()
const productDataLayer = require("../../dal/products")


router.get("/", async (req, res) => {
    let unSortedCategoriesData = await productDataLayer.getAllCategories()
    unSortedCategoriesData = unSortedCategoriesData.sort((a, b) => a[0] - b[0]);
    unSortedCategoriesData  = {
        categories: unSortedCategoriesData.map(category => {
            return { _id: category[0], name: category[1] };
        })
    };
    JSON.stringify(unSortedCategoriesData, null, 2)
    const allCategories = unSortedCategoriesData.categories
    res.json({
        "categories": allCategories
    })
})



module.exports = router;