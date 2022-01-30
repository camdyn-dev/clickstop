const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    adminSecret: { type: String, required: true }
})

module.exports = mongoose.model("Admin", AdminSchema)