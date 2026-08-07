const nodemailer = require('nodemailer');
const { pool } = require('../config/db');

// ─── Email Transporter ────────────────────────────────────────────────────────
let transporter = null;

const getTransporter = () => {
  if (!transporter && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
};

// ─── Email Sender ──────────────────────────────────────────────────────────────
const sendEmailNotification = async (toEmail, title, message) => {
  const t = getTransporter();
  if (!t || !toEmail) return;

  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || `"CareerCompass AI" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `🎯 CareerCompass: ${title}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 16px;">
          <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 28px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800;">🧭 CareerCompass AI</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0 0; font-size: 13px;">Smart Campus Placement Tracker</p>
          </div>
          <div style="background: white; padding: 28px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; margin: 0 0 12px 0; font-size: 18px; font-weight: 700;">${title}</h2>
            <p style="color: #64748b; line-height: 1.7; margin: 0;">${message}</p>
          </div>
          <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 16px;">
            You're receiving this because you're registered on CareerCompass AI.
          </p>
        </div>
      `
    });
  } catch (err) {
    console.warn('Email notification failed (non-critical):', err.message);
  }
};

// ─── Create a single notification for a student ────────────────────────────────
const createNotification = async (studentId, type, title, message) => {
  try {
    await pool.execute(
      `INSERT INTO notifications (student_id, type, title, message) VALUES (?, ?, ?, ?)`,
      [studentId || null, type, title, message]
    );
  } catch (err) {
    console.warn('Failed to create notification:', err.message);
  }
};

// ─── Broadcast to ALL students ─────────────────────────────────────────────────
const notifyAllStudents = async (type, title, message, sendEmail = true) => {
  try {
    // Get all active students with email
    const [students] = await pool.execute(
      `SELECT id, email, full_name FROM students WHERE email IS NOT NULL`
    );

    for (const student of students) {
      // Create in-app notification
      await pool.execute(
        `INSERT INTO notifications (student_id, type, title, message) VALUES (?, ?, ?, ?)`,
        [student.id, type, title, message]
      );

      // Send email asynchronously (fire and forget)
      if (sendEmail) {
        sendEmailNotification(student.email, title, message);
      }
    }
  } catch (err) {
    console.warn('Failed to notify all students:', err.message);
  }
};

// ─── Deadline Checker (runs on startup and checks deadlines within 3 days) ────
const checkUpcomingDeadlines = async () => {
  try {
    const [companies] = await pool.execute(`
      SELECT id, company_name, job_role, deadline
      FROM companies
      WHERE deadline IS NOT NULL
        AND deadline BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
    `);

    for (const company of companies) {
      const deadline = new Date(company.deadline).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      const title = `⏰ Application Deadline Near — ${company.company_name}`;
      const message = `Hurry! The application deadline for **${company.company_name}** (${company.job_role}) is on **${deadline}**. Apply now before it closes!`;

      // Check if we already sent this notification recently (in last 2 days)
      const [existing] = await pool.execute(`
        SELECT id FROM notifications
        WHERE type = 'deadline_near'
          AND message LIKE ?
          AND created_at > DATE_SUB(NOW(), INTERVAL 2 DAY)
        LIMIT 1
      `, [`%${company.company_name}%`]);

      if (existing.length === 0) {
        await notifyAllStudents('deadline_near', title, message, true);
        console.log(`Deadline notification sent for: ${company.company_name}`);
      }
    }
  } catch (err) {
    console.warn('Deadline check error:', err.message);
  }
};

module.exports = {
  createNotification,
  notifyAllStudents,
  sendEmailNotification,
  checkUpcomingDeadlines
};
