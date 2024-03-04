const express = require('express');
const bcrypt = require("bcrypt")
const router = express.Router();

const { bootstrapField, createRegistrationForm, createLoginForm } = require('../forms');
const { User } = require('../models');
const { loggedIn } = require('../middleware');

router.get("/signup", (req, res) => {
    const form = createRegistrationForm()
    res.render("users/signup", {
        form: form.toHTML(bootstrapField)

    })
})

router.post("/signup", (req, res) => {
    const form = createRegistrationForm()
    form.handle(req, {
        "success": async function (form) {
            // new User is based on the model
            const user = new User({
                username: form.data.username,
                email: form.data.email,
                password: await bcrypt.hash(form.data.password, 10)
            });
            await user.save()
            // res.flash("Your account has been created, please login!")
            res.redirect("/users/login")
        },
        "error": function (form) {
            res.render("users/signup", {
                form: form.toHTML(bootstrapField)
            })
        },
        "empty": function (form) {
            res.render("users/signup", {
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get("/login", (req, res) => {
    const form = createLoginForm()
    res.render("users/login", {
        form: form.toHTML(bootstrapField)
    })
})

router.post("/login", (req, res) => {
    const form = createLoginForm()
    form.handle(req, {
        "success": async function (form) {
            //find user by email first
            const user = await User.where(
                { email: form.data.email }
            ).fetch({
                require: false // no exception will be thrown if the user is not found
                // true means bookshelf will say your username is not found
            })

            if (user) {
                // check the password
                if (await bcrypt.compare(form.data.password, user.get("password"))) { // The hash MUST Be the second argument
                    // if true, then user is verified
                    // let's record the user's logi to sessions
                    req.session.userId = user.get("id")
                    res.redirect("/users/profile")
                } else {
                    req.flash("error_messages", "Unable to log in, please try again")
                    res.redirect("/users/login")
                }
            } else {
                req.flash("error_messages", "Unable to log in, please try again")
                res.redirect("/users/login")
            }
        }
    })
})

router.get("/profile", [loggedIn], async (req, res)=>{
    const user = await User.where({
        id: req.session.userId
    }).fetch({
        required:true
    })
    res.render("users/profile", {
        user:user.toJSON()
    })
})

module.exports = router
