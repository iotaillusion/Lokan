const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CONTACT_RECIPIENT'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

let transporter;
if (missingEnv.length === 0) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE !== 'false' : Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else {
  console.warn(`Missing SMTP configuration values: ${missingEnv.join(', ')}`);
}

function ensureTransport() {
  if (!transporter) {
    throw new Error('Email transport is not configured. Please check SMTP environment variables.');
  }
  return transporter;
}

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  try {
    const mailer = ensureTransport();
    await mailer.sendMail({
      from: process.env.CONTACT_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_RECIPIENT,
      replyTo: email,
      subject: `Lokan website contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message.replace(/\n/g, '<br>')}</p>`
    });

    return res.json({ message: 'Thanks for reaching out! We will be in touch shortly.' });
  } catch (error) {
    console.error('Contact form submission failed:', error);

    const status = error.message && error.message.includes('transport') ? 500 : 502;
    const errorMessage =
      status === 500
        ? 'Email service is not configured. Please try again later.'
        : 'We could not send your message. Please try again.';
    return res.status(status).json({ error: errorMessage });
  }
});

app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Lokan site running on http://localhost:${port}`);
});
