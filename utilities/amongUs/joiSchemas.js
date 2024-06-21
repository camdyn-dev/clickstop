const BaseJoi = require("joi")

const sanitizeHtml = require('sanitize-html');

//this makes sure it doesn't include HTML
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

//validates item input - admin only
const validateItem = Joi.object({
    item: Joi.object({
        name: Joi.string().escapeHTML().required(),
        price: Joi.number().min(1).required(),
        description: Joi.string().escapeHTML(),
    }).required(),
    deleteImages: Joi.array()
})

//validates review input - user facing
const validateReview = Joi.object({
    review: Joi.object({
        title: Joi.string().escapeHTML().min(4).max(40).required(),
        rating: Joi.number().min(0).max(5).required(),
        body: Joi.string().escapeHTML().min(10).max(500)
    }).required()
})


//validates login - user and admin facing
const validateLogin = Joi.object({
    username: Joi.string().escapeHTML().min(3).max(30).required(),
    password: Joi.string().escapeHTML().min(5).max(64).required()
})

//validates registration, user facing
const validateRegistration = Joi.object({
    username: Joi.string().escapeHTML().min(3).max(30).required(),
    email: Joi.string().email().escapeHTML().min(10).required(),
    password: Joi.string().escapeHTML().min(5).max(64).required()
})

module.exports.validateItem = validateItem
module.exports.validateReview = validateReview
module.exports.validateLogin = validateLogin
module.exports.validateRegistration = validateRegistration

