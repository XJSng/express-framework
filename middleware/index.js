const { User } = require("../models")

const loggedIn = async (req, res, next) => {
    if (req.session.userId) {
        // User has never logged in before
        if (!req.session.user) {
            const user = await User.where({
                id: req.session.userId
            }).fetch({
                required: true
            })
            const userData = user.toJSON()
            req.session.user = {
                username: userData.username,
                email: userData.email
            }
        }
        next()
    } else {
        req.flash("error_messages", "You must be logged in to view this page")
        res.redirect("/users/login")
    }
}

module.exports = { loggedIn }