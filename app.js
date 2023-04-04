const express = require("express");
const { engine } = require("express-handlebars");
const Handlebars = require("handlebars");
const dbConnect = require("./dbConnect");
const userRouter = require("./routers/userRouter");
const adminRouter = require("./routers/adminRouter");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();

dbConnect();
const app = express();

app.engine("hbs", engine({ extname: ".hbs" }));
app.set("view engine", "hbs");

// Register the ifEqual helper
Handlebars.registerHelper("ifEqual", function (a, b, options) {
  if (a === b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: "mongodb://127.0.0.1:27017/E_commerce",
    }),
    secret: "12656",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(express.json());

app.use(function (req, res, next) {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate"
  );
  next();
});

app.use("/admin", adminRouter);
app.use("/", userRouter);

app.use(function (req, res, next) {
  res.status(404).render("user/error");
});

app.listen(4000, () => {
  console.log("server running");
});

