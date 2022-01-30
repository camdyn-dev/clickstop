const { validateItem, validateReview, validateLogin, validateRegistration } = require("./joiSchemas")
const ExpressError = require("../ExpressError")

//input validation for item
module.exports.itemValidation = (req, res, next) => {
    const { error } = validateItem.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        req.flash("error", "Invalid characters used in post!")
        throw new ExpressError(400, msg)
    } else {

        next()
    }
}

//input validation for review
module.exports.reviewValidation = (req, res, next) => {
    const { error } = validateReview.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        req.flash("error", "Invalid characters used in post!")
        throw new ExpressError(400, msg)
    }
    else {

        next()
    }
}

//not sure how to do this without Joi, but it's worth doing cause mongo injection n shit; validates login and register paths
module.exports.loginValidation = (req, res, next) => {
    const { error } = validateLogin.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        req.flash("error", "Invalid characters used in post!")
        throw new ExpressError(400, msg)
    }
    else {
        next()
    }
}

module.exports.registerValidation = (req, res, next) => {
    const { error } = validateRegistration.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        req.flash("error", "Invalid characters used in post!")
        throw new ExpressError(400, msg)
    }
    else {
        next()
    }
}