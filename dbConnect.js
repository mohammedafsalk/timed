
const mongoose = require("mongoose");
const dbConnect = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(`mongodb+srv://techafs456:GOGGOQKRiDh9Cpl9@cluster1.q8lap20.mongodb.net/?retryWrites=true&w=majority`)
    .then(() => {
      console.log(" DB connected");
    })
    .catch((err) => {
      console.log("error" + err);
    });
};

module.exports = dbConnect;
