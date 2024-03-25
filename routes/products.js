const express = require('express');
const router = express.Router();

const { Product } = require('../models');
const { createProductForm, bootstrapField, createSearchForm } = require('../forms');
const { getAllTags, getAllCategories, getProductById, createProduct } = require('../dal/products');
// const { mustBePositive } = require('../service_layer/products');



router.get('/', async function (req, res) {
    const allCategories = await getAllCategories()
    // Added a new category to the array, in the front,
    // allowing users to not search for anything
    allCategories.unshift([0, "All Categories"])
    const allTags = await getAllTags()
    allTags.unshift([0, "Any Tags"])
    const searchForm = createSearchForm(allCategories, allTags)
    searchForm.handle(req, {
        "success": async form => {
            const q = Product.collection() // nothing is fetched yet
            if (form.data.name) {
                q.where("name", "like", `%${form.data.name}%`)
            }

            if (form.data.min_cost) {
                q.where("cost", ">=", `${form.data.min_cost}`)
            }

            if (form.data.max_cost) {
                q.where("cost", "<=", `${form.data.max_cost}`)
            }

            // Check if the form.data.category_id exists in the form
            // and make sure it doesn't contain string "0"
            // all values from a <select> are sent as string
            if (form.data.category_id && form.data.category_id != "0") {
                q.where("category_id", "=", parseInt(form.data.category_id))
            }

            if (form.data.tags && form.data.tags != "0") {
                q.query("join", "products_tags", "products.id", "product_id")
                    .where("tag_id", "in", form.data.tags.split(","));
            }
            const products = await q.fetch({
                withRelated: ["category", "tags"]
            })
            res.render("products/index", {
                products: products.toJSON(),
                form: form.toHTML(bootstrapField)
            })
        },
        "error": async form => {
            let products = await Product.collection().fetch({
                withRelated: ["category", "tags"]
            });
            res.render("products/index", {
                products: products.toJSON(),
                form: searchForm.toHTML(bootstrapField)
            })
        },
        "empty": async form => {
            let products = await Product.collection().fetch({
                withRelated: ["category", "tags"]
            });
            res.render("products/index", {
                products: products.toJSON(),
                form: searchForm.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/create', async function (req, res) {
    // create an instance of the form
    // fetch all categories
    const allCategories = await getAllCategories()
    const allTags = await getAllTags()

    const productForm = createProductForm(allCategories, allTags);
    res.render('products/create', {
        form: productForm.toHTML(bootstrapField),
        // Import cloudinary dependencies
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/create', async function (req, res) {
    // fetch all categories
    const allCategories = await getAllCategories()
    //Fetch all the Tags and map them into an array of array, and for each inner array, element 0 is ID and element 1 is the name
    const tags = await getAllTags()

    const productForm = createProductForm(allCategories, tags);
    // start the form processing
    productForm.handle(req, {
        "success": async function (form) {
            console.log(form)
            // we want to extract the information
            // submitted in the form and create a new product

            // If we are referring to the model name (eg. Product)
            // we are referring to the entire table

            // If we are creating a new instance of the model (like below)
            // it means we are referring a ROW in the table
            const product = await createProduct(form.data);
            let tags = form.data.tags
            // the tags will be in comma delimited form
            // so for example if the user selects ID 3, 5 and 6
            // then form.data.tags will be "3,5,6"
            if (tags) {
                // attach function requires an array of IDs
                // In this case, we are attach IDs to product's tags
                await product.tags().attach(tags.split(","))
            }
            // IMPORTANT for a Flash message to work, It must be used before a redirect,
            // if not, it will show up at the wrong time
            req.flash("success_messages", "New product has been added!") // req.session.messages.success_messages = ["New Product has been added!"]
            res.redirect('/products');

        },
        "error": function (form) {
            res.render('products/create', {
                form: form.toHTML(bootstrapField),
                cloudinaryName: process.env.CLOUDINARY_NAME,
                cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
            })
        },
        "empty": function (form) {
            res.render('products/create', {
                form: form.toHTML(bootstrapField),
                cloudinaryName: process.env.CLOUDINARY_NAME,
                cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
            })
        }
    })
})

router.get("/:product_id/update", async (req, res) => {
    try {
        const product = await getProductById(req.params.product_id)

        if (!product) {
            req.flash("error_messages", "Product ID doesn't exist!")
            res.redirect("/product")
            return
        }

        // fetch all the categories
        const allCategories = await getAllCategories()
        const allTags = await getAllTags()

        const productForm = createProductForm(allCategories, allTags);
        productForm.fields.name.value = product.get('name')
        productForm.fields.cost.value = product.get('cost')
        productForm.fields.description.value = product.get('description')
        productForm.fields.category_id.value = product.get('category_id')
        productForm.fields.image_url.value = product.get("image_url")

        // Fill in the multi-select for the tags
        let selectedTags = await product.related("tags").pluck("id");
        productForm.fields.tags.value = selectedTags
        res.render("products/update", {
            form: productForm.toHTML(bootstrapField),
            product: product.toJSON(),
            // Import cloudinary dependencies
            cloudinaryName: process.env.CLOUDINARY_NAME,
            cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
            cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
        })
    } catch (error) {
        console.error("Error fetching product", error)
        res.status(404).json({ error: "Product not found" })
    }
})

router.post('/:product_id/update', async function (req, res) {
    // fetch all the categories
    const allCategories = await getAllCategories()
    const allTags = await getAllTags()
    // fetch the product that we want to update
    const product = await getProductById(req.params.product_id)

    if (!product) {
        req.flash("error_messages", "Product ID doesn't exist!")
        res.redirect("/products")
        return
    }

    //process the form
    const productForm = createProductForm(allCategories, allTags);
    productForm.handle(req, {
        "success": async function (form) {
            // product.set('name', form.data.name);
            // product.set('cost', form.data.cost);
            // product.set('description', form.data.description);
            //This retrieves the selected tags and product data from the form.
            let { tags, ...productData } = form.data
            product.set(productData);
            await product.save();

            // process tags
            let tagIds = tags.split(",")
            let existingTagIds = await product.related("tags").pluck("id")

            // Remove all tags that aren't selected anymore
            let toRemove = existingTagIds.filter(id => tagIds.includes(id) === false)
            await product.tags().detach(toRemove)

            // Add in all the tags selected in the form
            await product.tags().attach(tagIds)
            res.redirect('/products');
        },
        "error": async function (form) {
            res.render('products/update', {
                form: form.toHTML(bootstrapField),
                cloudinaryName: process.env.CLOUDINARY_NAME,
                cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
            })
        },
        "empty": async function (form) {
            res.render('products/update', {
                form: form.toHTML(bootstrapField),
                cloudinaryName: process.env.CLOUDINARY_NAME,
                cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
            })
        }
    })
})

router.get('/:product_id/delete', async function (req, res) {
    try {
        // get the product that we want to update
        const product = await getProductById(req.params.product_id)

        if (!product) {
            req.flash('error_messages', "Product ID doesn't exist");
            res.redirect('/products');
            return;
        }

        res.render('products/delete', {
            'product': product.toJSON()
        })
    } catch (error) {
        // if no such product is found, throw an exception
        console.error("Error fetching product", error)
        res.status(404).json({ error: "Product not found" })
    }
})

router.post('/:product_id/delete', async function (req, res) {
    try {
        const product = await getProductById(req.params.product_id)
        if (!product && !req.params.product_id) {
            req.flash('error_messages', "Product ID doesn't exist");
            res.redirect('/products');
            return;
        }

        await product.destroy();
        req.flash("success_messages", "Product has been deleted")
        res.redirect('/products');
    } catch (error) {
        // if no such product is found, throw an exception
        console.error("Error fetching product", error)
        res.status(404).json({ error: "Product not found" })


    }
})

module.exports = router;