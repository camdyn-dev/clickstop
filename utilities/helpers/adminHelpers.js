const Admin = require("../../models/admin.js");

module.exports.adminCheck = async (req, res, next) => {
    //checks if an admin is currently logged in or not
    const admin = await Admin.findOne({ adminSecret: process.env.ADMIN_SECRET })
    if (req.session.adminCheck) {
        if (req.session.adminCheck === admin.id) {
            console.log("adminCheck proc: success")
            return next()
        }
        console.log("adminCheck proc: ADMIN BUT NOT REAL ADMIN")
        req.session.adminCheck = null
        return res.redirect("/shop/main")
    }
    console.log("adminCheck proc: no admin logged in")
    req.flash("error", "You need to be logged in!")
    return res.redirect("/bingChillin/adminLogin")
}