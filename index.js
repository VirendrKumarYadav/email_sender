const express = require("express");
const { SMTPServer } = require("smtp-server");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");


const upload = multer({ dest: "uploads/" }); 
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
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
  const {name,email,phone,message } = req.body;

  if (!name || !email || (!phone && !message)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let info = await transporter.sendMail({
     from: `"${name}" <${email}>`,
      to:"akhilesh@jmvx.solutions",
      subject: `Form Submission By ${name}`,
      text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nMessage: ${message}`,
      html: `<h2>New Contact Form Submission</h2>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Phone:</strong> ${phone}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong> ${message}</p>`,
    });

    console.log("📧 Email sent:", info.messageId);
    res.json({ message: "Email sent successfully!", messageId: info.messageId });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});


app.post("/send-career-mail", upload.single("file"), async (req, res) => {
    const { name, email, phone, details } = req.body;
    const file = req.file;

    if (!name || !email || !phone || !details || !file) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        let info = await transporter.sendMail({
            from: `"${name}" <${email}>`,
            to: "akhilesh@jmvx.solutions",
            subject: `Career Form Submission from ${name}`,
            text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nDetails: ${details}`,
            html: `<h2>New Career Submission</h2>
                   <p><strong>Name:</strong> ${name}</p>
                   <p><strong>Phone:</strong> ${phone}</p>
                   <p><strong>Email:</strong> ${email}</p>
                   <p><strong>Details:</strong> ${details}</p>`,
            attachments: [
                {
                    filename: file.originalname,
                    path: file.path,
                },
            ],
        });

        console.log("📧 Career Form Email Sent:", info.messageId);
        res.json({ message: "Career form submitted successfully!", messageId: info.messageId });
    } catch (error) {
        console.error("❌ Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Express server running on port ${PORT}`);
});
