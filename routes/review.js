//express
const express = require("express");
const router = express.Router();


//helper utilities
const asyncHandler = require("../utilities/helpers/asyncHandler.js");
const loginCheck = require("../utilities/helpers/loginCheck.js");
const reviewOwner = require("../utilities/helpers/reviewCheck.js");
const { reviewValidation } = require("../utilities/amongUs/joiValidation.js");
const emailCheck = require("../utilities/helpers/emailCheck")


//functional utilities
const reviewAverage = require("../utilities/functional/reviewAverage.js");

//models
const Item = require("../models/item.js");
const Review = require("../models/review.js");


//routes
router.post("/createReview/:itemID", loginCheck, emailCheck, reviewValidation, asyncHandler(async (req, res) => {
    const itemID = req.params.itemID
    const item = await Item.findById(itemID).populate("reviews")
    const review = await new Review(req.body.review)

    // Create review
    review.author = req.session.currentUser
    review.postDate = getDate()
    await review.save()

    // Add review to item
    item.reviews.push(review)
    item.ratingAvg = reviewAverage(item)
    await item.save()

    req.flash("success", "Review posted!")
    res.redirect(`/shop/item/${itemID}`)
}))

router.delete("/deleteReview/:itemID/:reviewID", loginCheck, emailCheck, reviewOwner, asyncHandler(async (req, res) => {
    const { itemID, reviewID } = req.params
    //finds the IDs, finds the review and pulls it of the item, then deletes the review
    await Item.findByIdAndUpdate(itemID, { $pull: { reviews: reviewID } })
    await Review.findByIdAndDelete(reviewID)
    //finds the item again, calculates its average rating then sets it
    const item = await Item.findById(itemID).populate("reviews")
    if (item.reviews.length > 0) {
        item.ratingAvg = reviewAverage(item)
    }
    else {
        item.ratingAvg = 0
    }
    console.log(item.ratingAvg)
    await item.save()
    req.flash("success", "Review deleted!")
    res.redirect(`/shop/item/${itemID}`)
}))

module.exports = router;