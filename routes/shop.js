//express
const express = require("express");
const router = express.Router();


//helper utilities
const asyncHandler = require("../utilities/helpers/asyncHandler.js");
const loginCheck = require("../utilities/helpers/loginCheck.js");


//models
const Item = require("../models/item.js");
const User = require("../models/user.js");


//routes
router.get("/main", asyncHandler(async (req, res) => {
    const user = await User.findById(req.session.currentUser).populate("shoppingCart")
    const items = await Item.find({}).populate("reviews")
    res.render("shop/main.ejs", { items, user })
}))
router.get("/allItems", asyncHandler(async (req, res) => {
    const user = await User.findById(req.session.currentUser).populate("shoppingCart")
    const items = await Item.find({}).populate("reviews")
    res.render("shop/index.ejs", { items, user })
}))

router.get("/item/:id", asyncHandler(async (req, res) => {
    const user = await User.findById(req.session.currentUser).populate("shoppingCart")
    const item = await Item.findById(req.params.id).populate({ path: "reviews", populate: { path: "author" } })
    const preItems = await Item.find({}).populate("reviews")
    let items = [] //more like "relatedItems", but I was too lazy to change the naming scheme. It works fine, tho
    for (i of preItems) {
        if (i.id !== item.id) {
            items.push(i)
        }
    }
    //this checks if the rendered item is in the cart or not, which decides whether or not to add the "Add to cart" button.
    //there is a function for multiple items built into the template, but this is a little better organized this way. Might put it in it's own function
    let inCart = false
    if (req.session.currentUser) {
        for (arrayItem of user.shoppingCart) {
            if (arrayItem.id == item.id) {
                inCart = true
            }
        }
    }
    res.render("shop/itemDetails.ejs", { item, items, user, inCart })
}))

//Cart related routes

router.get("/cart", loginCheck, asyncHandler(async (req, res) => {
    const user = await User.findById(req.session.currentUser).populate("shoppingCart")
    const shoppingCart = user.shoppingCart
    const paypalId = process.env.PAYPAL_KEY
    res.render("shop/cart.ejs", { user, shoppingCart, paypalId })
}))


//adding item to cart
router.post("/addToCart/:id", loginCheck, asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id)
    const user = await User.findById(req.session.currentUser).populate("shoppingCart")
    //same cart function as above. probably a good idea to put it in its own function, since I'm using it twice
    let inCart = false
    for (arrayItem of user.shoppingCart) {
        if (arrayItem.id === item.id) {
            inCart = true
        }
    }
    if (!inCart) {
        user.shoppingCart.push(item)
        await user.save()
        req.flash("success", "Item added to cart!")
        res.redirect(`/shop/item/${item.id}`)
    } else if (inCart) {
        req.flash("error", "Item already in cart!")
        res.redirect("/shop/cart")
    }

}))


//removing item from cart, need to change the paths since they're confusing
router.delete("/removeFromCart/:itemID", loginCheck, asyncHandler(async (req, res) => {
    const userID = req.session.currentUser
    const itemID = req.params.itemID
    //god this took forever to find out. mongo is hard 2 memory
    await User.findByIdAndUpdate(userID, { $pull: { shoppingCart: itemID } })
    req.flash("success", "Item removed from cart!")
    res.redirect("/shop/cart")
}))


module.exports = router

// I need to figure out a good way to disable the add to cart button when the thing is already in da cart
// ^ dis has been done