
const mongoose = require("mongoose");
const dbConnect = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect('mongodb://127.0.0.1:27017/E_commerce')
    .then(() => {
      console.log(" DB connected");
    })
    .catch((err) => {
      console.log("error" + err);
    });
};

module.exports = dbConnect;
