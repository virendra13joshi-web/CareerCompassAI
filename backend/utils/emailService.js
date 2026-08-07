const nodemailer = require('nodemailer');

const { EMAIL_USER, EMAIL_PASS } = process.env;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error("ERROR: EMAIL_USER or EMAIL_PASS environment variables are missing. Email sending will fail.");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text, html) => {
  try {
    let info = await transporter.sendMail({
      from: '"CareerCompass AI" <noreply@careercompass.ai>',
      to,
      subject,
      text,
      html,
    });
    
    console.log(`Email sent successfully to:\n${to}`);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = {
  sendEmail,
};
