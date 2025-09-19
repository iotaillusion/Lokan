// api/contact.js
const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, message } = req.body || {};
  if (!name || !email || !message || message.length > 5000) return res.status(400).end();

  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE) === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  await t.sendMail({
    from: process.env.CONTACT_FROM,
    to: process.env.CONTACT_RECIPIENT,
    replyTo: email,
    subject: `Contact: ${name}`,
    text: message.slice(0, 10000)
  });

  res.status(204).end();
};
