const { SMTPServer } = require("smtp-server");
const dotenv = require("dotenv");

dotenv.config();

// Create SMTP Server
const server = new SMTPServer({
  authOptional: true, // Allow connections without authentication
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

// Start the SMTP server
server.listen(2525, () => {
  console.log("SMTP Server running on port 2525");
});
