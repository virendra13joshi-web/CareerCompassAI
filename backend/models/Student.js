const { pool } = require('../config/db');

const Student = {
  create: async (studentData) => {
    const { full_name, username, email, password, google_id, verification_token } = studentData;
    // Check if it's the first user
    const [countResult] = await pool.execute('SELECT COUNT(*) as count FROM students');
    const role = countResult[0].count === 0 ? 'admin' : 'student';

    // For Google users without a username, auto-generate one from email
    const resolvedUsername = username || (email ? email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') : null);

    const query = `
      INSERT INTO students (full_name, username, email, password, google_id, verification_token, is_verified, role)
      VALUES (?, ?, ?, ?, ?, ?, TRUE, ?)
    `;
    const [result] = await pool.execute(query, [
      full_name || resolvedUsername || 'User',
      resolvedUsername || null,
      email || null,
      password || null,
      google_id || null,
      verification_token || null,
      role
    ]);
    return result.insertId;
  },

  findByUsername: async (username) => {
    const query = `SELECT * FROM students WHERE username = ?`;
    const [rows] = await pool.execute(query, [username]);
    return rows[0];
  },

  findByEmail: async (email) => {
    const query = `SELECT * FROM students WHERE email = ?`;
    const [rows] = await pool.execute(query, [email]);
    return rows[0];
  },

  findById: async (id) => {
    const query = `SELECT * FROM students WHERE id = ?`;
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  },

  findByVerificationToken: async (token) => {
    const query = `SELECT * FROM students WHERE verification_token = ?`;
    const [rows] = await pool.execute(query, [token]);
    return rows[0];
  },

  verifyStudent: async (id) => {
    const query = `UPDATE students SET is_verified = TRUE, verification_token = NULL WHERE id = ?`;
    await pool.execute(query, [id]);
  },

  saveResetToken: async (id, token, expiry) => {
    const query = `UPDATE students SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?`;
    await pool.execute(query, [token, expiry, id]);
  },

  findByResetToken: async (token) => {
    const query = `SELECT * FROM students WHERE reset_password_token = ? AND reset_password_expires > NOW()`;
    const [rows] = await pool.execute(query, [token]);
    return rows[0];
  },

  updatePassword: async (id, newPassword) => {
    const query = `UPDATE students SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?`;
    await pool.execute(query, [newPassword, id]);
  },

  updateProfile: async (id, profileData) => {
    const { 
      full_name, phone_number, college, branch, semester, cgpa, 
      skills, linkedin, github, resume_url, profile_picture_url 
    } = profileData;

    // Build dynamic update query
    let updateFields = [];
    let values = [];

    if (full_name !== undefined) { updateFields.push('full_name = ?'); values.push(full_name); }
    if (phone_number !== undefined) { updateFields.push('phone_number = ?'); values.push(phone_number); }
    if (college !== undefined) { updateFields.push('college = ?'); values.push(college); }
    if (branch !== undefined) { updateFields.push('branch = ?'); values.push(branch); }
    if (semester !== undefined) { updateFields.push('semester = ?'); values.push(semester); }
    if (cgpa !== undefined) { updateFields.push('cgpa = ?'); values.push(cgpa); }
    if (skills !== undefined) { updateFields.push('skills = ?'); values.push(skills); }
    if (linkedin !== undefined) { updateFields.push('linkedin = ?'); values.push(linkedin); }
    if (github !== undefined) { updateFields.push('github = ?'); values.push(github); }
    if (resume_url !== undefined) { updateFields.push('resume_url = ?'); values.push(resume_url); }
    if (profile_picture_url !== undefined) { updateFields.push('profile_picture_url = ?'); values.push(profile_picture_url); }

    if (updateFields.length === 0) return;

    values.push(id);
    const query = `UPDATE students SET ${updateFields.join(', ')} WHERE id = ?`;
    await pool.execute(query, values);
  }
};

module.exports = Student;
