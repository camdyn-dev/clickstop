//basic mongo and mongoose bullshit
const bcrypt = require("bcrypt")
const mongoose = require("mongoose");

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/shopping');
  await console.log("fuck you")
}

//mongo models
const Item = require("../models/item.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");
const Admin = require("../models/admin.js");
const Transaction = require("../models/transaction.js");

const getDate = () => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  let currentDate = new Date();
  let cDay = currentDate.getDate()
  let cMonth = currentDate.getMonth()
  let cYear = currentDate.getFullYear()
  const date = `${months[cMonth]} ${cDay}, ${cYear}`
  return date
}

const inseminate = async function () {
  await Item.deleteMany({})
  await User.deleteMany({})
  await Review.deleteMany({})
  await Admin.deleteMany({})
  await Transaction.deleteMany({})
  const hash = await bcrypt.hash("adminBullshit@69", 10)
  const userHash = await bcrypt.hash("fuckingShit@69", 10)
  const admin = await new Admin({
    username: "admin",
    password: hash,
    adminSecret: "epicGaming"
  })
  await admin.save()
  const user = await new User({
    username: "user",
    password: userHash,
    email: "peeescee@gmail.com",
    emailConfirmed: true,
    shoppingCart: [],
    purchaseHistory: []
  })
  await user.save()
  for (let i = 0; i < 8; i++) {
    let randomPrice = Math.floor(Math.random() * 100) + 1
    let randomFuckMaster = Math.floor(Math.random() * 9000) + 1
    const item = new Item({
      name: `fuckmaster${randomFuckMaster}`,
      price: randomPrice,
      description: "can i put my balls in yo jaw (my balls) balls in yo jaw, can Ieeee CAN IIIIIEEYYEE CAN I CAN IIIIYYEEE",
      owner: user.id
    })
    item.images.push({ path: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=810&q=80", name: "seedImg" }, { path: "https://images.unsplash.com/photo-1580835239846-5bb9ce03c8c3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=736&q=80", name: "buttahDawg" })
    for (let i = 0; i < 3; i++) {
      let review = new Review({
        title: "My fucking balls fell off",
        rating: 5,
        body: "Seriously, I no longer have testicles because of this item. It's unbelievable, I literally do not have balls anymore. My balls are gone. My testicles have been forgotten.",
        postDate: getDate(),
        author: user.id
      })
      await review.save()
      item.reviews.push(review)
    }
    item.ratingAvg = 5
    await item.save()
  }

  console.log("INSEMINATION FINISHED")
}

inseminate()