//i'll figure out the production vs deployment shit later l m a o x d p p 4 2 0
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

//basic express stuff
const express = require("express");
const app = express();
const session = require("express-session");
const engine = require("ejs-mate");
const MongoStore = require("connect-mongo")

//utilities
const methodOverride = require("method-override");
const path = require("path");
const flash = require("connect-flash")


//error handling and security
const mongoSanitize = require("express-mongo-sanitize")
const ExpressError = require("./utilities/ExpressError.js");
const helmet = require("helmet")


//session options - currently they're just in like test mode. will revise to be better later, maybe add an ENV file to manage it correctly?
const mongoLink = process.env.MONGO_LINK
const store = MongoStore.create({
    mongoUrl: mongoLink,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.COOKIE_SECRET
    }
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})
const sessionOptions = {
    store,
    name: "shopStopCookie",
    secret: process.env.COOKIE_SECRET,
    cookie: {
        expires: Date.now() + 604800000, // One week
        maxAge: 604800000, //Basically the same as above
        httpOnly: true,
    },
    resave: false,
    saveUninitialized: true,
    //did those two since it spat out errors, dunno what they actually do lol
}

//express and EJS
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session(sessionOptions))


//utilities and auth related stuff
app.use(methodOverride("_method"));
app.use(flash())
app.use((req, res, next) => {
    res.locals.currentUser = req.session.currentUser //this is used for login purposes
    res.locals.adminCheck = req.session.adminCheck //this is used for admin purposes
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next();
})


//security and error handling

//mongo security, mainly to (hopefully) resist injection attacks
app.use(
    mongoSanitize({
        replaceWith: '_',
    }),
);
//helmet security
app.use(
    helmet({
        contentSecurityPolicy: false, //i should prob reconfigure this some day to allow cloudinary images, but i don wanna
        crossOriginEmbedderPolicy: false //this lets me use images from cloudinary. there's probably a sec issue with it but i'll figure that out later
    })
);


//basic mongo and mongoose stuff
const mongoose = require("mongoose")


main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(mongoLink);
}
// "mongodb://localhost:27017/shopping"


//route imports
const shopRoutes = require("./routes/shop.js");
const paymentRoutes = require("./routes/payment.js");
const adminRoutes = require("./routes/admin.js");
const reviewRoutes = require("./routes/review")
const userRoutes = require("./routes/user.js");


//route execution
//you'll notice that, annoyingly, I pass user into every route. there's probably a better way of doing it, but it's so the shopping cart functions in the header
app.use("/shop", shopRoutes)
app.use("/payment", paymentRoutes)
app.use("/bingChillin", adminRoutes)
app.use("/review", reviewRoutes)
app.use("/user", userRoutes)

app.get("/", (req, res) => {
    res.redirect("/shop/main")
})

//go to a 404 if none of the links are found
app.all('*', (req, res, next) => {
    res.render("error/404.ejs")
})

app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong" } = err;
    if (!err.message) {
        err.message = "Uh oh, something ain't workin', and we don't have a 100% on what it is."
    }
    res.status(status).render("error/error.ejs", { err })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("fuck you")
})
