import { createTransport } from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ status: 'error', message: 'Missing fields' });
  }
  const transport = createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  try {
    await transport.sendMail({
      from: `${name} <${email}>`,
      to: process.env.CONTACT_EMAIL,
      subject: 'Contact Form Submission',
      text: message,
    });
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error' });
  }
}
