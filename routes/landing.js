const express = require('express')
const router = express.Router()


router.get("/", (req, res)=>{
if (req.session.visitCount) {
    req.session.visitCount++;
} else {
    req.session.visitCount = 1;
}

    res.render("landing/index")
})

router.get("/about-us", (req, res)=>{
    res.render("landing/about-us")
})

router.get("/contact-us", (req, res)=>{
    res.render("landing/contact-us")
})

module.exports = router