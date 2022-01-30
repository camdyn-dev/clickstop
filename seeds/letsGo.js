if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const bcrypt = require("bcrypt")
const mongoose = require("mongoose");
const mongoLink = process.env.MONGO_LINK

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(mongoLink);
    await console.log("fuck you")
}

//mongo models
const Item = require("../models/item.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");
const Admin = require("../models/admin.js");
const Transaction = require("../models/transaction.js");

const letsGo = async function () {
    await Item.deleteMany({})
    await User.deleteMany({})
    await Review.deleteMany({})
    await Admin.deleteMany({})
    await Transaction.deleteMany({})
    const hash = await bcrypt.hash("adminBullshit@69420", 12)
    const admin = await new Admin({
        username: "admin",
        password: hash,
        adminSecret: "epicGaming"
    })
    await admin.save()
    console.log("LET'S GOOOOOOOOOOOOOOOOO")
}
letsGo()