const nodemailer = require("nodemailer");

async function sendEmail() {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // MUST be false for port 587
      auth: {
        user: "patmanseth@gmail.com",
        pass: "tkmf muci irwt qlnc", // Gmail app password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    let info = await transporter.sendMail({
      from: '"Seth" <patmanseth@gmail.com>',
      to: "norahchikanda@gmail.com",
      subject: "Test Email ✔",
      text: "Hello, this is a simple email from Node.js!",
      html: "<b>Hello, this is a simple email from Node.js!</b>",
    });

    console.log("Email sent:", info.messageId);

  } catch (err) {
    console.error("EMAIL ERROR:", err);
  }
}

sendEmail();
