// Requiring the Modules.
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Instantiating the app.
const app = express();

// Setting the view engine to ejs.
app.set("view engine", "ejs");

// Configuring the app.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Database Connection
const url = process.env.URL;
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Database Connected");
  });

// Customer Schema
const customerSchema = new mongoose.Schema({
  accountNo: Number,
  name: String,
  balance: Number,
  email: String,
  gender: String,
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  sender: String,
  reciever: String,
  amount: Number,
  time: String,
});

// Customer Model
const Customer = mongoose.model("Customer", customerSchema);
// Transaction Model
const Transaction = mongoose.model("Transaction", transactionSchema);

// GET Routes:

// Home route- Renders the Index page.
app.get("/", (req, res) => {
  res.render("home");
});

// Customers route- Shows all the customers.
app.get("/customers", async (req, res) => {
  try {
    const customers = await Customer.find({});
    res.render("customers", { customers: customers });
  } catch (err) {
    console.log(err);
  }
});

// Transfer route- Renders the transfer page to make a transaction.
app.get("/transfer", async (req, res) => {
  try {
    const customers = await Customer.find({});
    res.render("transfer", {
      customers: customers,
      success: "",
      hist: false,
      sender: {},
    });
  } catch (err) {
    console.log(err);
  }
});

// Transfer route for a specific sender.
app.get("/transfer/:id", async (req, res) => {
  id = req.params.id;
  try {
    var s = await Customer.findById(id, {});
  } catch (err) {
    console.log(err);
  }
  try {
    const customers = await Customer.find({});
    res.render("transfer", {
      customers: customers,
      success: "",
      hist: false,
      sender: s,
    });
  } catch (err) {
    console.log(err);
  }
});

// Transactions route- Shows all the transactions.
app.get("/transactions", async (req, res) => {
  try {
    const trans = await Transaction.find({});
    res.render("transaction", { trans: trans });
  } catch (err) {
    console.log(err);
  }
});

// Add-customer route- To add a new customer.
app.get("/add-customer", (req, res) => {
  res.render("new-customer", { fail: "" });
});

// POST Routes

// Transfer route- To make a transaction and update the database.
app.post("/transfer", async (req, res) => {
  var s = req.body.sender;
  var r = req.body.reciever;
  var a = Number(req.body.amt);

  try {
    var customers = await Customer.find({});
  } catch (err) {
    console.log(err);
  }

  try {
    var doc = await Customer.findByIdAndUpdate(s, { $inc: { balance: -a } });
    console.log("Updated Sender");
    s = doc.name;
    var doc = await Customer.findByIdAndUpdate(r, { $inc: { balance: a } });
    console.log("Updated Reciever");
    r = doc.name;
    var t = new Date().toLocaleTimeString();
    var d = new Date().toLocaleDateString();
  } catch (err) {
    console.log(err);
    res.render("transfer", {
      customers: customers,
      success: "false",
      hist: false,
      sender: {},
    });
  }

  try {
    const doc = new Transaction({
      sender: s,
      reciever: r,
      amount: a,
      time: d + " " + t,
    });
    await doc.save();
    console.log("Saved Transaction");
    res.render("transfer", {
      customers: customers,
      success: "true",
      hist: true,
      sender: {},
    });
  } catch (err) {
    console.log(err);
    res.send("error");
  }
});

// Add-customer route- To add the new customer in the database.
app.post("/add-customer", async (req, res) => {
  try {
    var acc = await Customer.find({}, { accountNo: 1, _id: 0 });
    acc.forEach((a) => {
      if (Number(req.body.accountNo) === a.accountNo) {
        throw "Account number already exists!";
      }
    });
  } catch (err) {
    res.render("new-customer", { fail: err });
  }

  const c = new Customer({
    accountNo: Number(req.body.accountNo),
    name: req.body.name,
    email: req.body.email,
    gender: req.body.gender,
    balance: Number(req.body.balance),
  });

  try {
    await c.save();
    res.redirect("/customers");
  } catch (err) {
    console.log(err);
  }
});

// Server
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, () => {
  console.log("Server started successfully!");
});
