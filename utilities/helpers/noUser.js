//makes sure there isn't a user currently logged in
module.exports = noUser = (req, res, next) => {
    if (!req.session.currentUser) {
        console.log("noUser proc - no user")
        return next()
    } else {
        console.log("noUser proc - there is a user")
        req.flash("error", "Already logged in!")
        return res.redirect("/shop/main")
    }

};