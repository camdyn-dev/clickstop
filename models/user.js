//this is a little funky, not 100% sure how I'm gonna do this cause I really DON'T wanna add in auth and shit, maybe i'll just do some gay shit i dunno

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Item = require("./item")

const UserSchema = new Schema({
    email: String,
    username: String,
    password: String,
    shoppingCart: [
        { type: Schema.Types.ObjectId, ref: "Item" }
    ],
    purchaseHistory: [
        { type: Schema.Types.ObjectId, ref: "Transaction" }
    ],
    emailConfirmed: Boolean
})

module.exports = mongoose.model("User", UserSchema)