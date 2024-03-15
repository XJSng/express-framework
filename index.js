const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();
const csurf = require("csurf")

// import dependecies for sessions
const session = require("express-session")
const flash = require("connect-flash")
// indicate that our session will use file for storage
const FileStore = require("session-file-store")(session)

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
  express.urlencoded({
    extended: false
  })
);

//enable sessions
app.use(session({
  store: new FileStore,
  secret: "keyboard cat",
  resave: false, // if a browser send a request and there is a valid session Id
  saveUninitialized: true // if the browser does not have a session, we will create one for the browser
}))

// enable flash messaging
app.use(flash());

app.use(function (req, res, next) {
  // res.locals contains all the variable of the success message
  // The hbs files have access this forcefully added variable

  res.locals.success_messages = req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");
  next();
});

// enable CSURF
// app.use(csurf())
const csurfInstance = csurf()
// Make csurf token available in all HBS files
app.use(function (req, res, next) {
  if (req.url == "/checkout/process_payment" || req.url.slice(0, 5) == "/api/") {
    return next()
  }
  csurfInstance(req, res, next)
})

// Error handling in csrf middleware
app.use(function (err, req, res, next) {
  if (err && err.code == "EBADCSRFTOKEN") {
    req.flash("error_messages", "The form has expired")
    res.redirect("back") // same as pressing the BACK button on the 
  } else {
    next()
  }
})

// enable routes
const landingRoutes = require("./routes/landing.js")
const productRoutes = require("./routes/products.js")
const userRoute = require("./routes/users.js")
const cloudinaryRoutes = require("./routes/cloudinary.js")

const api = { products: require("./routes/api/products.js") }

async function main() {
  app.use("/", landingRoutes)
  app.use("/products", productRoutes)
  app.use("/users", userRoute)
  app.use("/cloudinary", cloudinaryRoutes)

  app.use("/api/products", api.products)
}

main();

app.listen(2000, () => {
  console.log("Server has started");
});

