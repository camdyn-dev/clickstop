const Review = require("../../models/review.js");

module.exports = reviewOwner = async (req, res, next) => {
    //checks whether or not the current user is the review's owner
    const itemID = req.params.itemID
    const reviewID = req.params.reviewID
    const review = await Review.findById(reviewID).populate("author")
    if (req.session.currentUser) {
        if (req.session.currentUser == review.author.id) {
            console.log("reviewCheck proc - actual review owner")
            return next()
        }
    } else {
        console.log("reviewCheck proc - not review owner")
        req.flash("error", "You don't own that review!")
        res.redirect(`/shop/item/${itemID}`)
    }
}