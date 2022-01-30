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

app.listen(3000, () => {
    console.log("fuck you")
})







//current plan for dis shit
//1: get da basic CRUD: MOSTLY DONE, need to add the UPDATE part, images and some other stuff ig
//2: get da sexurity
//should get a thing to confirm logins first - DONE
//need to get an ownerCheck and other stuff too - DONE (i think)
//when i get the edit thing in, add or either reuse the ownerCheck thing to DO ET
//3: get da error handling
//4: get da cee ess ess
//5: prob do ENV stuff 4 extra sexkurity

// got the cloudinary image shit figured out, so now I have to redo the image view page, index, cart, etc. it shoiuld be pretty simple, just changing a few things on cart and index, but i'll need to add a carousel or something to the item view - done
// mostly little busy shit to get done now like
// seperate login and register routes and make a middleware for them to make sure no-one's logged in (!req.session.currentUser) - done
// add in JOI and do everything that comes with that, like edit and new item validations, login validations, html sanitization, etc - pm done
// add in helmet
// fix the fucking CSS since it looks like shit xd pepega poopooger
// other stuff that i'll eventually think of, including cleaning up these fucking files since they're D I S G U S T I N G


// I have had an epiphany
// I shouldn't be designing this with the intention of it being some kind of form thing with many users that sell stuff. NAY, instead, I should make it where it is MY website where I sell stuff. That way, the checkout process is extremely simplified, like;
// Originally, I was planning on having it where you could check out items from multiple users at once, but the only reason places like ebay and amazon are able
// to do that is because every seller registers through amazon, which then takes their percentage then sends the money to the seller. That's not reasonably
// achieveable for this small scale application (I will likely do something like that sometime in the future though, now that I think about it), BUT, doing it where
// you can check out with ONE payment address (maybe via Stripe or Paypal) is most definitely possible (and probably easy-ish), and has the actual opportunity
// of making me money. I'm not sure exactly what I'm going to sell, but I can figure that out once it's fully put together. More important though, I can
// use this as a shell that's restylable with CSS and sell that to people who have shit to sell (Mily as an idea, once I put the whole thing together).
// I am most definitely going to clone this project before doing that restructure, though, as it's an extremely good shell for practically any CRUD website, and
// I can just repurporse the userItems and shopping cart as like a bookmarking thing I guess. Maybe I can sell courses like every other person who learns basic
// javascript and programming shit? I do have de certs, so maybe I can think of some idea where I train kids about computers or programming or some shit and market
// it through journey.

// Now, if I wanted to do something with the original idea, I could probably do away with the cart OR have carts for specific user profiles, but the latter sounds
// extremely laborous to implement while the former sounds like a good idea with something like Paypal hyperlinks with notes or some shit I dunno. But,
// the idea of turning this into my own shop is a very good one, since I can actually make money off of that once I figure out wtf I'm going to sell.

// Task list with this idea;
// FIRST THINGS FUCKING FIRST, CLONE THIS REPOSITORY BEFORE DOING ANYTHING. I said it before, but this is an extremely good shell atm, so I would like 2 keep it.
// *: Modify the CRUD routes to only accept one User, which is ME, NIGGA. I will probably keep all the verification shit tho because I don't want to break my own
// website kek
// *: Overhaul the naming and pages and shit. I won't really need the userprofile route, as I will be the only person using it, and this project could really use
// some organization whether or not I had the epiphany
// *: Likely, what I'm going to do first is related to fixing the program to only support one poster but many viewers with accounts, but once I'm done with that
// I'll need to figure out the shopping cart and how it's going to work with stripe. That firebase guy on youtube said he has a course on Stripe, so I'll
// check that out, but paypal might be the go-to I dunno. With that, though, I need to add a few things, namely a way to store completed orders and give and maybe
// give them a confirmation route or some shit. I can also create a route that accesses all that (heavily secured of course).
// *: Get an email service thing. I'll probably do this both for registration to confirm emails (which maybe I'll just send a hyperlink with their user_id and
// token to a template to their email). I'll also use this when I'm sending the product.

//Ideas on how to implement
// *: Related to storing orders, maybe I'll create a PlacedOrders model that adds an order number/SKU, references the Item and the User, then populate them on a
// page or something. Relating to sending it to emails, all I gotta do is populate the item and user email. For the item itself, maybe I'll create a seperate model
// that stores information on the actual item and keep the original Item model for listings? I dunno, not sure atm.


//god, now that this restructure is mostly done, I just need to re-do some of the admin routes, and it's pretty much done on the creation side. then I just need to do some error handling and security shit