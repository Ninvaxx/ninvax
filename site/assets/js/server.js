const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).send('Missing fields');
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || "587", 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    await transport.sendMail({
      from: `${name} <${email}>`,
      to: process.env.CONTACT_EMAIL,
      subject: 'Contact Form Submission',
      text: message
    });
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error' });
  }
});

app.post('/signup', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).send('Missing fields');
  }
  const signup = { name, email, timestamp: new Date().toISOString() };
  const file = require('path').join(__dirname, '..', 'beta_signups.json');
  let data = [];
  try {
    data = JSON.parse(fs.readFileSync(file));
  } catch (err) {
    // file might not exist or be empty
  }
  data.push(signup);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  res.status(200).json({ status: 'ok' });
});

app.use(express.static('.'));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
