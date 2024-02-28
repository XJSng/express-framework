const express = require('express');
const router = express.Router();

const { Product, Category, Tag } = require('../models');
const { createProductForm, bootstrapField } = require('../forms');


router.get('/', async function (req, res) {
   
    // Same as SELECT * FROM products
    let products = await Product.collection().fetch({
        withRelated: ["category", "tags"]
    }); // bookshelf syntax
    res.render("products/index", {
        products: products.toJSON()
    })
})

router.get('/create', async function (req, res) {
    // create an instance of the form
    // fetch all categories
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get("name")]
    })
    const allTags = await Tag.fetchAll().map(tag => [tag.get("id"),
    tag.get("name")])

    const productForm = createProductForm(allCategories, allTags);
    res.render('products/create', {
        form: productForm.toHTML(bootstrapField)
    })
})

router.post('/create', async function (req, res) {
    // fetch all categories
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get("name")]
    })
    //Fetch all the Tags and map them into an array of array, and for each inner array, element 0 is ID and element 1 is the name
    const tags = await Tag.fetchAll().map(tag => [
        tag.get("id"),
        tag.get("name")])

    const productForm = createProductForm(allCategories, tags);
    // start the form processing
    productForm.handle(req, {
        "success": async function (form) {
            // we want to extract the information
            // submitted in the form and create a new product

            // If we are referring to the model name (eg. Product)
            // we are referring to the entire table

            // If we are creating a new instance of the model (like below)
            // it means we are referring a ROW in the table

            const product = new Product();
            product.set('name', form.data.name);
            product.set('cost', form.data.cost);
            product.set('description', form.data.description);
            product.set('category_id', form.data.category_id)

            // save
            await product.save();
            let tags = form.data.tags
            // the tags will be in comma delimited form
            // so for example if the user selects ID 3, 5 and 6
            // then form.data.tags will be "3,5,6"
            if (tags) {
                // attach function requires an array of IDs
                // In this case, we are attach IDs to product's tags
                await product.tags().attach(tags.split(","))
            }

            res.redirect('/products');

        },
        "error": function (form) {
            res.render('products/create', {
                form: form.toHTML(bootstrapField)
            })
        },
        "empty": function (form) {
            res.render('products/create', {
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get("/:product_id/update", async (req, res) => {
    try {
        const product = await Product.where({
            "id": req.params.product_id
        }).fetch({
            require: true, // if no such product is found, throw an exception
            withRelated: ["tags"]
        })

        // fetch all the categories
        const allCategories = await Category.fetchAll().map((category) => {
            return [category.get('id'), category.get('name')];
        })
        const allTags = await Tag.fetchAll().map((tag) => {
            return [tag.get('id'), tag.get('name')];
        })

        const productForm = createProductForm(allCategories, allTags);
        productForm.fields.name.value = product.get('name')
        productForm.fields.cost.value = product.get('cost')
        productForm.fields.description.value = product.get('description')
        productForm.fields.category_id.value = product.get('category_id')

        // Fill in the multi-select for the tags
        let selectedTags = await product.related("tags").pluck("id");
        productForm.fields.tags.value = selectedTags
        res.render("products/update", {
            form: productForm.toHTML(bootstrapField)
        })
    } catch (error) {
        console.error("Error fetching product", error)
        res.status(404).json({ error: "Product not found" })
    }
})

router.post('/:product_id/update', async function (req, res) {
    // fetch all the categories
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')];
    })

    // fetch the product that we want to update
    const product = await Product.where({
        id: req.params.product_id
    }).fetch({
        require: true,
        withRelated: ["tags"]
    })

    //process the form
    const productForm = createProductForm(allCategories);
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
                form: form.toHTML(bootstrapField)
            })
        },
        "empty": async function (form) {
            res.render('products/update', {
                form: form.toHTML(bootstrapField)
            })
        }
    })
})


router.get('/:product_id/delete', async function (req, res) {
    try {
        // get the product that we want to update
        const product = await Product.where({
            'id': req.params.product_id
        }).fetch({
            require: true
        });

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
        const product = await Product.where({
            'id': req.params.product_id
        }).fetch({
            require: true // if no such product is found, throw an exception
        });
        await product.destroy();
        res.redirect('/products');
    } catch (error) {
        // if no such product is found, throw an exception
        console.error("Error fetching product", error)
        res.status(404).json({ error: "Product not found" })
    }
})

module.exports = router;