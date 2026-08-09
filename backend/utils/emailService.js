const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, text, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "CareerCompass AI <onboarding@resend.dev>",
      to: [to],
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Resend email error:", error);
      throw new Error(error.message || "Failed to send email");
    }

    console.log(`Email sent successfully to: ${to}`);
    console.log(`Resend Email ID: ${data?.id}`);

    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = {
  sendEmail,
};