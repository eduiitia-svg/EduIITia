const nodemailer = require("nodemailer");

async function sendEmailHandler(req, res) {
  const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    const { to, html, subject } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: to, subject, html",
      });
    }

    const mailOptions = {
      from: `"EduIITia" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

module.exports = sendEmailHandler;
