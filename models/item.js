const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: { type: String, required: true },
    ratingAvg: {
        type: Number
    },
    price: { type: Number, required: true },
    description: { type: String },
    images: [{
    }],
    adminID: { type: Schema.Types.ObjectId, ref: "User" },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }]
})

module.exports = mongoose.model("Item", ItemSchema)