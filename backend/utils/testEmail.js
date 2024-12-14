require("dotenv").config(); // Load environment variables from .env
const sendEmail = require("./send_email"); // Adjust the path to your sendEmail file

(async () => {
  try {
    const emailData = {
      to: "drob992004@gmail.com", // Replace with the recipient's email
      subject: "Test Email from Railway System",
      text: "This is a plain-text test email.",
      html: "<p>This is a <strong>test email</strong> with HTML content.</p>",
    };

    console.log("Sending test email...");
    const result = await sendEmail(emailData);
    console.log("Test email sent successfully:", result);
  } catch (error) {
    console.error("Error sending test email:", error);
  }
})();
