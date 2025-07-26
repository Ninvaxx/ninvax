const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  let data;
  try {
    data = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }
  const { name, email } = data;
  if (!name || !email) {
    return { statusCode: 400, body: 'Missing fields' };
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'ninvax@icloud.com',
      subject: 'New Beta Signup',
      text: `Name: ${name}\nEmail: ${email}`,
    });
    return { statusCode: 200, body: 'Success' };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Error sending email' };
  }
};
