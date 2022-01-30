//checks if a user is currently logged in
module.exports = loginCheck = (req, res, next) => {
    if (!req.session.currentUser) {
        console.log("loginCheck proc - no user")
        req.flash("error", "You need to be logged in!")
        return res.redirect("/user/login")
    }
    console.log("loginCheck proc - logged in user")
    next()

}