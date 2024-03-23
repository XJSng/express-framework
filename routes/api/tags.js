const express = require("express")
const router = express.Router()
const productDataLayer = require("../../dal/products")

router.get("/", async (req, res) => {
    let allTags = await productDataLayer.getAllTags()

    res.json({
        "Tags": allTags
    })
})

module.exports = router;