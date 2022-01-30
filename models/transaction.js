const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    orderData: { type: Object, required: true },
    customer: { type: Schema.Types.ObjectId, ref: "User" },
    date: { type: String }
})

module.exports = mongoose.model("Transaction", TransactionSchema)