const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = Schema({
    title: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    body: {
        type: String,
    },
    postDate: {
        type: String,
    },
    author: { type: Schema.Types.ObjectId, ref: "User" }
})

module.exports = mongoose.model("Review", ReviewSchema)