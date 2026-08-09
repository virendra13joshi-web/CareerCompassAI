const { Resend } = require("resend");

// Guard: warn loudly at startup if API key is missing so it's visible in Render logs
if (!process.env.RESEND_API_KEY) {
  console.error(
    "⚠️  RESEND_API_KEY is not set. Verification emails will fail. " +
    "Please add RESEND_API_KEY to your environment variables."
  );
}

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
      // Log full error object so the actual Resend rejection reason is visible in logs
      console.error("Resend API error details:", JSON.stringify(error, null, 2));
      throw new Error(error.message || "Failed to send email via Resend");
    }

    console.log(`Email sent successfully to: ${to}`);
    console.log(`Resend Email ID: ${data?.id}`);

    return data;
  } catch (err) {
    console.error("Error sending email:", err.message || err);
    throw err;
  }
};

module.exports = {
  sendEmail,
};