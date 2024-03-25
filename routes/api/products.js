const express = require("express")
const router = express.Router()
const productDataLayer = require("../../dal/products")
const { createProductForm } = require("../../forms")
const { getProducts } = require("../../service_layer/products")
const cors = require("cors")

router.get("/", async (req, res) => {
    const allProducts = await getProducts()
    res.json({
        "products": allProducts.toJSON()
    })
})

// get by Id
router.get("/:productId", async (req, res) => {
    try {
        const productId = req.params.productId;
        const getProductById = await productDataLayer.getProductById(productId)
        if (getProductById) {
            res.json({
                "product": getProductById.toJSON()
            })
        } else {
            res.status(404).json({ error: "Product not found" })
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.post("/", async (req, res) => {
    // use DAL
    const productForm = createProductForm();
    productForm.handle(req, {
        "success": async form => {
            const { tags, ...productData } = form.data
            const product = await productDataLayer.createProduct(productData)
            if (tags) {
                await product.tags().attach(tags.split(","))
            }
            res.json({
                product: product.toJSON()
            })
        },
        "empty": () => {
            res.sendStatus(401)
        },
        "error": (form) => {
            let errors = {};
            // All the fields in the form
            for (let key in form.fields) {
                //check if there are any errors in the given key
                const error = forms.field[key].error;
                if (error) {
                    errors[key] = error
                }
            }
            res.json({
                "errors": errors
            })
        }
    })

})

// Need to work on PUT AND DELETE
router.put("/:productId", async (req, res) => {
    // I want to find the product by it's Id
    // if the Id exist, update with the new input
    // if the id does not exist, return product does not exist
    // if the id fields are wrong, return the respective errors
    const incomingProductId = await productDataLayer.getProductById(req.params.productId)
    if (!incomingProductId) {
        res.sendStatus(404)
    }
    const allCategories = await productDataLayer.getAllCategories()
    const allTags = await productDataLayer.getAllTags()    
    const productForm = createProductForm(allCategories,allTags);
    productForm.handle(req, {
        "success": async form => {
            const { tags, ...productData } = form.data
            incomingProductId.set(productData);
            await incomingProductId.save();
            let tagIds = tags.split(",")
            let existingTagIds = await incomingProductId.related("tags").pluck("id")

            // Remove all tags that aren't selected anymore
            let toRemove = existingTagIds.filter(id => tagIds.includes(id) === false)
            await incomingProductId.tags().detach(toRemove)

            // Add in all the tags selected in the form
            await incomingProductId.tags().attach(tagIds)
            res.json({
                product: incomingProductId.toJSON()
            })
        },
        "empty": async () => {
            res.sendStatus(401)
        },
        "error": async (form) => {
            let errors = {};
            // All the fields in the form
            for (let key in form.fields) {
                //check if there are any errors in the given key
                const error = forms.field[key].error;
                if (error) {
                    errors[key] = error
                }
            }
            res.json({
                "errors": errors
            })
        }
    })
})

router.delete("/:productId", async (req, res) => {
    const productId = req.params.productId;
    const searchedProduct = await productDataLayer.getProductById(productId)
    try {

        if (!searchedProduct) {
            res.sendStatus(404)
        } else {
            await searchedProduct.destroy();
            console.log("Deleted")
            res.sendStatus(200)
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
})

module.exports = router;