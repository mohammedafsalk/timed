const nodemailer = require("nodemailer");
const validator = require("email-validator");

const sentOTP = (email, otp) => {
  return new Promise((resolve, reject) => {
    console.log('validating',email);
    // Validate the email address
    if (!validator.validate(email)) {
      console.log('invalid',email);
      return reject(new Error("Invalid email address"));
    }

    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    var mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "TIMED Email verification",
      html: `
              <h1>Verify Your Email For TIMED</h1>
                <h3>use this code to verify your email</h3>
                <h2>${otp}</h2>
              `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("email sent error ", error);
        reject(error);
      } else {
        resolve(otp);
        console.log("email sent successfull");
      }
    });
  });
};

module.exports = sentOTP;
