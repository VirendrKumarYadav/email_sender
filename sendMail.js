const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 2525, // Same port as the SMTP server
  secure: false, // No SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail() {
  try {
    let info = await transporter.sendMail({
      from: '"Virendra Yadav" <test@example.com>',
      to: "recipient@example.com",
      subject: "Test Email from SMTP Server",
      text: "Hello, this is a test email sent using a custom SMTP server.",
      html: "<b>Hello, this is a test email sent using a custom SMTP server.</b>",
    });

    console.log("Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

sendMail();
