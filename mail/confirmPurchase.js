const nodemailer = require("nodemailer")
const ejs = require("ejs")
require("dotenv").config()

module.exports = async function orderEmail(order, email) {
    const transporter = nodemailer.createTransport({
        port: 465,
        host: "smtp.gmail.com",
        auth: {
            user: 'noreply.shopstop@gmail.com',
            pass: process.env.EMAIL_PASSWORD,
        },
        secure: true,
    });
    const data = await ejs.renderFile(__dirname + "/purchaseConfirmation.ejs", { order });
    const mainOptions = {
        from: '"ClickStop" <noreply.shopstop@gmail.com>',
        to: email,
        subject: 'Thank you! - Your order',
        html: data
    };
    let info = await transporter.sendMail(mainOptions);
    console.log("Message sent: %s", info.messageId);
}

// i really need to clean this up eventually, but for now it works really well. I dunno if I want to use one mailer function OR have multiple of these
// for different cases (like order confirmation vs )
