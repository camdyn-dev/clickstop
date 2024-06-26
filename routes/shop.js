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
    const user = await User.findById(req.session.currentUser).populate(
      "shoppingCart"
    );

    const items = await Item.find({}).populate("reviews");
    res.render("shop/main.ejs", { items, user });
  })
);

router.get("/allItems", asyncHandler(async (req, res) => {
    const user = await User.findById(req.session.currentUser).populate(
      "shoppingCart"
    ); 
    const items = await Item.find({}).populate("reviews");
    res.render("shop/index.ejs", { items, user });
  })
);

router.get("/item/:id", asyncHandler(async (req, res) => {
    const user = await User.findById(req.session.currentUser).populate(
      "shoppingCart"
    );

    const item = await Item.findById(req.params.id).populate({
      path: "reviews",
      populate: { path: "author" },
    });
    
    const preItems = await Item.find({}).populate("reviews");
    let items = preItems.filter((i) => {
      return i.id !== item.id;
    });

    let inCartPass = false;
    
    if (req.session.currentUser) {
      user.shoppingCart.forEach((cartItem) => {
        if (cartItem.id === item.id) inCartPass = true;
      });
      
    }
    res.render("shop/itemDetails.ejs", { item, items, user, inCartPass });
  })
);

//Cart related routes
router.get("/cart", loginCheck, asyncHandler(async (req, res) => {
    const user = await User.findById(req.session.currentUser).populate(
      "shoppingCart"
    );
    const shoppingCart = user.shoppingCart;
    const paypalId = process.env.PAYPAL_KEY;
    res.render("shop/cart.ejs", { user, shoppingCart, paypalId });
  })
);

//adding item to cart
router.post("/addToCart/:id", loginCheck, asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);
    const user = await User.findById(req.session.currentUser).populate("shoppingCart");
    //same cart function as above. probably a good idea to put it in its own function, since I'm using it twice
    let inCart = false;
    user.shoppingCart.forEach((cartItem) => {
      if (cartItem.id === item.id) inCart = true;
    });
    if (!inCart) {
      user.shoppingCart.push(item);
      await user.save();
      req.flash("success", "Item added to cart!");
      res.redirect(`/shop/item/${item.id}`);
    } else if (inCart) {
      req.flash("error", "Item already in cart!");
      res.redirect("/shop/cart");
    }
  })
);

//removing item from cart, need to change the paths since they're confusing
router.delete("/removeFromCart/:itemID", loginCheck, asyncHandler(async (req, res) => {
    const userID = req.session.currentUser;
    const itemID = req.params.itemID;
    

    await User.findByIdAndUpdate(userID, { $pull: { shoppingCart: itemID } });
    req.flash("success", "Item removed from cart!");
    res.redirect("/shop/cart");
  })
);

module.exports = router;
