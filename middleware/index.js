const loggedIn = (req, res, next) => {
    if (req.session.userId) {
        next()
    } else {
        req.flash("error_messages", "You must be logged in to view this page")
        res.redirect("/users/login")
    }
}

module.exports = { loggedIn }