const express = require("express")
const router = express.Router()
const productDataLayer = require("../../dal/products")
const { createProductForm } = require("../../forms")


router.get("/", async (req, res) => {
    const allProducts = await productDataLayer.getAllProducts()
    res.json({
        "products": allProducts.toJSON()
    })
})

router.post("/", async (req, res) => {
    // use
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
router.put("/", async (req, res)=>{

})

router.delete("/", async (req, res)=>{
    
})

module.exports = router;