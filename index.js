const express = require("express");
const { SMTPServer } = require("smtp-server");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

const smtpServer = new SMTPServer({
  authOptional: true,
  onData(stream, session, callback) {
    let emailData = "";
    stream.on("data", (chunk) => {
      emailData += chunk.toString();
    });
    stream.on("end", () => {
      console.log("Received email:\n", emailData);
      callback(null);
    });
  },
  onAuth(auth, session, callback) {
    if (auth.username === process.env.SMTP_USER && auth.password === process.env.SMTP_PASS) {
      callback(null, { user: auth.username });
    } else {
      return callback(new Error("Invalid username or password"));
    }
  },
});

smtpServer.listen(2525, () => {
  console.log("✅ SMTP Server running on port 2525");
});

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
  port: 587,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post("/send-mail", async (req, res) => {
  const { to, cc, bcc, subject, text, html } = req.body;

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let info = await transporter.sendMail({
      from: ['"Virendra Yadav" <softech.vire@gmail.com>', '"Alternet Sender" <alternate@example.com>'],
      to,
      cc,
      bcc,
      subject,
      text,
      html,
    });

    console.log("📧 Email sent:", info.messageId);
    res.json({ message: "Email sent successfully!", messageId: info.messageId });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Express server running on port ${PORT}`);
});
