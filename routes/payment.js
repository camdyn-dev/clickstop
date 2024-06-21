//express
const express = require("express");
const router = express.Router();


//helper utilities
const loginCheck = require("../utilities/helpers/loginCheck.js");
const asyncHandler = require("../utilities/helpers/asyncHandler.js");


//functional utilities
const getDate = require("../utilities/functional/getDate")
const nodemailer = require("nodemailer") //not sure if nodemailer needs to be included or not
const orderEmail = require("../mail/confirmPurchase.js");


//models
const Item = require("../models/item.js"); // might use this later
const User = require("../models/user.js");
const Transaction = require("../models/transaction.js");


//routes
router.get("/items/:id", loginCheck, asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).populate("shoppingCart")
    res.send(user.shoppingCart)
}))

router.post("/transaction", asyncHandler(async (req, res) => {
    console.log("received transaction data via Axios")
    const user = await User.findById(req.body.id)

    // This is a bit of a convoluted way of passing things through, but this is how it works with paypal.
    const transaction = new Transaction({
        orderData: {
            orderId: req.body.orderData.id,
            orderStatus: req.body.orderData.status,
            orderDetails: {
                orderTotal: req.body.orderData.purchase_units[0].payments.captures[0],
                orderItems: req.body.orderData.purchase_units[0].items,
                orderShipping: req.body.orderData.purchase_units[0].shipping,
            }
        },
        customer: user.id,
        date: getDate()
    })
    await transaction.save() // All of it basically lets us save a transaction
    user.purchaseHistory.push(transaction) // then push it into a user's purchase history
    user.shoppingCart = []
    await user.save()
    //sends the order confirmation/"thank you" email to the user
    orderEmail(transaction.orderData, user.email).catch(e => { console.log(e) })
    //sends transaction ID to the confirmation/"thank you" page
    res.send(transaction.id)
}))

router.get("/complete/:id", loginCheck, asyncHandler(async (req, res) => {
    let transaction = await Transaction.findById(req.params.id)
    transaction = transaction.orderData
    const user = await User.findById(req.session.currentUser)
    res.render("payment/orderConfirmation.ejs", { transaction, user })

}))

module.exports = router