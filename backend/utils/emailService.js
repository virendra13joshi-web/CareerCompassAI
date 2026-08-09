/**
 * Email Service (Resend dependency removed)
 * Emails are now logged to console if called elsewhere in the system.
 */
const sendEmail = async (to, subject, text, html) => {
  console.log(`[Email Service Log] Email to: ${to} | Subject: ${subject}`);
  return { id: 'mock_email_id' };
};

module.exports = {
  sendEmail,
};