const User = require("../../models/user")

module.exports = emailCheck = async (req, res, next) => {
    //checks whether or not the user's email address is confirmed
    const itemID = req.params.itemID
    const user = await User.findById(req.session.currentUser)
    if (user.emailConfirmed) {
        next()
    }
    else {
        req.flash("error", "You need to confirm your email to do that.")
        res.redirect(`/shop/item/${itemID}`) //Doing this because I'll just add it directly into the form. I'm not 100% sure how I can directly redirect back to the page
    }
}