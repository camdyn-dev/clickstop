//I should probably rename the views folder to something like userViews, but it fits in with the other themes

//express
const express = require("express");
const router = express.Router();


//helper utilities
const asyncHandler = require("../utilities/helpers/asyncHandler.js");
const loginCheck = require("../utilities/helpers/loginCheck.js");
const { loginValidation, registerValidation } = require("../utilities/joi/joiValidation.js");
const noUser = require("../utilities/helpers/noUser.js");


//functional utilities
const bcrypt = require("bcrypt")
const confirmEmail = require("../mail/confirmEmail.js")


//models
const Item = require("../models/item.js");
const User = require("../models/user.js");
const Transaction = require("../models/transaction.js");


//routes
router.get("/register", noUser, (req, res) => {
    res.render("user/register.ejs")
})

router.post("/register", noUser, registerValidation, asyncHandler(async (req, res) => {
    const userCheck = await User.findOne({ username: req.body.username })
    const emailCheck = await User.findOne({ email: req.body.email })
    //making sure there isn't already a user with that name
    if (!userCheck && !emailCheck) {
        const hash = await bcrypt.hash(req.body.password, 12)
        const user = await new User({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            shoppingCart: [],
            purchaseHistory: [],
            emailConfirmed: false
        })
        await user.save()
        //this adds it to the cookie i think
        req.session.currentUser = user._id
        console.log(`POST /register: new user successfuly created`)
        req.flash("success", "Account created: Please confirm your email!")
        //sends an email for the user to confirm their email address
        confirmEmail(user.id, user.email).catch(e => { console.log(e) })
        return res.redirect("/shop/main")
    } else {
        //if a user with that username or email already exists
        console.log("POST /register: unsuccessful, username or email already taken!")
        req.flash("error", "Username or email already taken!")
        return res.redirect("/user/register")
    }

}))

router.get("/login", noUser, (req, res) => {
    res.render("user/login.ejs")
})

router.post("/login", noUser, loginValidation, asyncHandler(async (req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (user) {
        try {
            const result = await bcrypt.compare(password, user.password)
            if (result) {
                req.session.currentUser = user._id
                console.log(`POST /login: success`)
                req.flash("success", "Logged in!")
                res.redirect("/shop/main")
            } else {
                req.flash("error", "Username or password is incorrect")
                res.redirect("/user/login")
            }
        }
        catch (e) {
            console.log(e)
            //dunno if I really need this, as the async handler should already be handling this problem. I guess extra error checking isn't a bad thing tho
        }
    } else {
        req.flash("error", "Username or password is incorrect")
        res.redirect("/user/login")
    }
}))

router.get("/logout", loginCheck, (req, res) => {
    //logout works for both the admin and users
    req.session.currentUser = null
    req.session.adminCheck = null
    req.flash("success", "Logged out!")
    res.redirect("/shop/main")
})

router.get("/profile", loginCheck, asyncHandler(async (req, res) => {
    const user = await User.findById(req.session.currentUser).populate("purchaseHistory").populate("shoppingCart")
    res.render("user/userProfile.ejs", { user })
}))

router.get("/orderDetails/:id", loginCheck, asyncHandler(async (req, res) => {
    const user = await User.findById(req.session.currentUser).populate("shoppingCart")
    const transaction = await Transaction.findOne({ orderId: req.params.id })
    res.render("user/orderDetails.ejs", { transaction, user })
}))

router.get("/confirmEmail/:id", asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).populate("shoppingCart")
    user.emailConfirmed = true
    await user.save()
    res.render("user/confirmEmail.ejs", { user })
}))

module.exports = router;