const nodemailer = require("nodemailer")
const ejs = require("ejs")
require("dotenv").config()

module.exports = async function orderEmail(userId, email) {
    const transporter = nodemailer.createTransport({
        port: 465,
        host: "smtp.gmail.com",
        auth: {
            user: 'noreply.shopstop@gmail.com',
            pass: process.env.EMAIL_PASSWORD,
        },
        secure: true,
    });
    const data = await ejs.renderFile(__dirname + "/registrationConfirmation.ejs", { userId });
    const mainOptions = {
        from: '"ShopStop" <noreply.shopstop@gmail.com>',
        to: email,
        subject: 'Confirm your email',
        html: data
    };
    let info = await transporter.sendMail(mainOptions);
    console.log("Message sent: %s", info.messageId);
}
