const express = require("express")
const router = express.Router()
const productDataLayer = require("../../dal/products")

router.get("/", async (req, res) => {
    let unSortedTagsData = await productDataLayer.getAllTags()

    unSortedTagsData = unSortedTagsData.sort((a, b) => a[0] - b[0]);
    unSortedTagsData  = {
        tags: unSortedTagsData.map(tag => {
            return { _id: tag[0], name: tag[1] };
        })
    };
    JSON.stringify(unSortedTagsData, null, 2)
    const allTags = unSortedTagsData.tags
    res.json({
        "Tags": allTags
    })
})

module.exports = router;