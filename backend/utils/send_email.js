const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465, // Standard secure SMTP port
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASSWORD,
  },
  // Add better timeout handling
  connectionTimeout: 10000,
  socketTimeout: 15000,
  logger: true, // Enable logging for debugging
  debug: true, // Include debug info in logs
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Verify connection configuration
    await transporter.verify();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    console.log("Sending email to:", to);
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", {
      messageId: info.messageId,
      response: info.response,
    });

    return info;
  } catch (error) {
    console.error("Email error:", {
      name: error.name,
      message: error.message,
      code: error.code,
    });
    throw error;
  }
};

module.exports = sendEmail;
