//express
const express = require("express");
const router = express.Router();


//cloudinary
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'shoppingCart',
        allowedFormats: ["jpeg", "jpg", "png"]
    }
});

//helper utilities
const { adminCheck } = require("../utilities/helpers/adminHelpers.js");
const asyncHandler = require("../utilities/helpers/asyncHandler.js");
const { itemValidation, loginValidation } = require("../utilities/amongUs/joiValidation.js");


//functional utilities
const bcrypt = require("bcrypt")
const multer = require("multer");
const upload = multer({ storage });


//models
const Admin = require("../models/admin.js");
const Item = require("../models/item.js");
const Transaction = require("../models/transaction.js");
const Review = require("../models/review.js");



router.get("/adminMain", adminCheck, asyncHandler(async (req, res) => {
    const transactions = await Transaction.find({}).populate("customer")
    res.render("admin/adminMain.ejs", { transactions })
}))

router.get("/newItem", adminCheck, (req, res) => {
    res.render("admin/newItem.ejs")
})

router.post("/newItem", adminCheck, upload.array("images"), itemValidation, asyncHandler(async (req, res) => {
    //idk why I didn't just find the Admin by it's ID, that would prob work better
    const admin = await Admin.findOne({ adminSecret: "epicGaming" })
    //pretty sure this is already taken care of with the adminCheck helper
    if (req.session.adminCheck) {
        const item = new Item(req.body.item)
        item.adminID = admin.id
        console.log(`POST /newItem: ${req.files}`)
        for (image of req.files) {
            item.images.push({ path: image.path, name: image.filename })
        }
        await item.save()
        req.flash("success", "Item successfully created!")
        res.redirect(`/shop/item/${item.id}`)
    }
    else {
        console.log("NO PERMISSION")
        req.flash("error", "You don't have permission to do that!")
        res.redirect("/shop/main")
    }
}))



router.get("/editItem/:itemID", adminCheck, asyncHandler(async (req, res) => {
    const itemID = req.params.itemID
    const item = await Item.findById(itemID)
    res.render("admin/editItem.ejs", { item })
}))


router.patch("/editItem/:itemID", adminCheck, upload.array("images"), asyncHandler(async (req, res) => {
    const itemID = req.params.itemID
    const item = await Item.findByIdAndUpdate(itemID, req.body.item)
    const images = req.files.map(img => ({ path: img.path, name: img.filename }))
    item.images.push(...images)
    if (req.body.deleteImages) {
        for (let name of req.body.deleteImages) {
            await cloudinary.uploader.destroy(name)
        }
        await item.updateOne({ $pull: { images: { name: { $in: req.body.deleteImages } } } })
    }
    await item.save()
    req.flash("success", "Successful edit.")
    res.redirect(`/shop/item/${item.id}`)
}))


router.delete("/delistItem/:itemID", adminCheck, asyncHandler(async (req, res) => {
    const itemID = req.params.itemID
    const item = await Item.findById(itemID).populate("reviews")
    for (let image of item.images) {
        await cloudinary.uploader.destroy(image.name)
    }
    for (let review of item.reviews) {
        await Review.findByIdAndDelete(review.id)
    }
    await Item.findByIdAndDelete(itemID)
    res.redirect("/shop/allItems")
}))


router.get("/adminLogin", (req, res) => {
    res.render("admin/adminLogin.ejs")
})

router.post("/adminLogin", loginValidation, asyncHandler(async (req, res) => {
    const { username, password } = req.body
    const admin = await Admin.findOne({ username })
    try {
        const result = await bcrypt.compare(password, admin.password)
        if (result) {
            req.session.adminCheck = admin.id
            console.log(`POST /adminLogin: success`)
            res.redirect("/bingChillin/adminMain")
        }
        //this seems unneccesary as, when it fails, it errors
        else {
            req.flash("error", "Username or password is incorrect")
            res.redirect("/bingChillin/adminLogin")
        }
    }
    catch (e) {
        console.log(e)
        req.flash("error", "Username or password is incorrect")
        res.redirect("/bingChillin/adminLogin")
    }
}))

module.exports = router;