const { pool } = require('../config/db');
const { notifyAllStudents } = require('../services/notificationService');

// ─── Admin Stats Overview ─────────────────────────────────────────────────────
exports.getAdminStats = async (req, res) => {
  try {
    const [[students]] = await pool.execute('SELECT COUNT(*) as total FROM students');
    const [[companies]] = await pool.execute('SELECT COUNT(*) as total FROM companies');
    const [[experiences]] = await pool.execute('SELECT COUNT(*) as total FROM interview_experiences');
    const [[reports]] = await pool.execute('SELECT COUNT(*) as total FROM resume_reports');
    const [[roadmaps]] = await pool.execute('SELECT COUNT(*) as total FROM roadmaps');
    const [[notifications]] = await pool.execute('SELECT COUNT(*) as total FROM notifications');
    const [[chats]] = await pool.execute('SELECT COUNT(*) as total FROM chat_conversations');

    // Recent activity
    const [recentStudents] = await pool.execute(
      `SELECT id, full_name, email, branch, college, role, created_at FROM students ORDER BY created_at DESC LIMIT 5`
    );
    const [recentExperiences] = await pool.execute(
      `SELECT ie.id, ie.company_name, ie.role, ie.difficulty_level, ie.created_at, s.full_name as author
       FROM interview_experiences ie
       LEFT JOIN students s ON ie.student_id = s.id
       ORDER BY ie.created_at DESC LIMIT 5`
    );

    res.json({
      stats: {
        students: students.total,
        companies: companies.total,
        experiences: experiences.total,
        reports: reports.total,
        roadmaps: roadmaps.total,
        notifications: notifications.total,
        chats: chats.total
      },
      recent_students: recentStudents,
      recent_experiences: recentExperiences
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Students Management ──────────────────────────────────────────────────────
exports.getStudents = async (req, res) => {
  try {
    const search = req.query.search || '';
    const branch = req.query.branch || '';
    const role = req.query.role || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    let query = `SELECT id, full_name, email, phone, college, branch, semester, cgpa, skills, linkedin, github, profile_picture, role, created_at FROM students WHERE 1=1`;
    const values = [];

    if (search) {
      query += ` AND (full_name LIKE ? OR email LIKE ? OR college LIKE ?)`;
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (branch) { query += ` AND branch = ?`; values.push(branch); }
    if (role) { query += ` AND role = ?`; values.push(role); }

    const countQuery = query.replace('SELECT id, full_name, email, phone, college, branch, semester, cgpa, skills, linkedin, github, profile_picture, role, created_at FROM students', 'SELECT COUNT(*) as total FROM students');
    const [countRows] = await pool.execute(countQuery, values);

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    values.push(limit, offset);

    const [rows] = await pool.execute(query, values);
    res.json({ data: rows, total: countRows[0].total, page, totalPages: Math.ceil(countRows[0].total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, full_name, email, phone, college, branch, semester, cgpa, skills, linkedin, github, profile_picture, role, created_at FROM students WHERE id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStudentRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be student or admin.' });
    }
    await pool.execute('UPDATE students SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: `User role updated to ${role}.` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }
    await pool.execute('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ message: 'Student deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Resume Reports Management ────────────────────────────────────────────────
exports.getAllReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = `
      SELECT rr.id, rr.resume_filename, rr.ats_score, rr.summary, rr.created_at,
             s.full_name as student_name, s.email as student_email
      FROM resume_reports rr
      LEFT JOIN students s ON rr.student_id = s.id
      WHERE 1=1
    `;
    const values = [];

    if (search) {
      query += ` AND (s.full_name LIKE ? OR rr.resume_filename LIKE ?)`;
      values.push(`%${search}%`, `%${search}%`);
    }

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM resume_reports rr LEFT JOIN students s ON rr.student_id = s.id WHERE 1=1 ${search ? 'AND (s.full_name LIKE ? OR rr.resume_filename LIKE ?)' : ''}`,
      search ? [`%${search}%`, `%${search}%`] : []
    );

    query += ` ORDER BY rr.created_at DESC LIMIT ? OFFSET ?`;
    values.push(limit, offset);

    const [rows] = await pool.execute(query, values);
    res.json({ data: rows, total: countRows[0].total, page, totalPages: Math.ceil(countRows[0].total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    await pool.execute('DELETE FROM resume_reports WHERE id = ?', [req.params.id]);
    res.json({ message: 'Report deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Interview Experiences Management ────────────────────────────────────────
exports.getAllExperiences = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = `
      SELECT ie.id, ie.company_name, ie.role, ie.difficulty_level, ie.interview_date, ie.created_at,
             s.full_name as author_name,
             (SELECT COUNT(*) FROM experience_likes WHERE experience_id = ie.id) as likes_count,
             (SELECT COUNT(*) FROM experience_comments WHERE experience_id = ie.id) as comments_count
      FROM interview_experiences ie LEFT JOIN students s ON ie.student_id = s.id WHERE 1=1
    `;
    const values = [];
    if (search) {
      query += ` AND (ie.company_name LIKE ? OR ie.role LIKE ? OR s.full_name LIKE ?)`;
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM interview_experiences ie LEFT JOIN students s ON ie.student_id = s.id WHERE 1=1 ${search ? 'AND (ie.company_name LIKE ? OR ie.role LIKE ? OR s.full_name LIKE ?)' : ''}`,
      search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []
    );

    query += ` ORDER BY ie.created_at DESC LIMIT ? OFFSET ?`;
    values.push(limit, offset);

    const [rows] = await pool.execute(query, values);
    res.json({ data: rows, total: countRows[0].total, page, totalPages: Math.ceil(countRows[0].total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteExperience = async (req, res) => {
  try {
    await pool.execute('DELETE FROM interview_experiences WHERE id = ?', [req.params.id]);
    res.json({ message: 'Experience deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Roadmaps Management ──────────────────────────────────────────────────────
exports.getAllRoadmaps = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
      `SELECT r.id, r.dream_company, r.target_date, r.created_at, s.full_name as student_name, s.email as student_email
       FROM roadmaps r LEFT JOIN students s ON r.student_id = s.id
       ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [[countRow]] = await pool.execute('SELECT COUNT(*) as total FROM roadmaps');

    res.json({ data: rows, total: countRow.total, page, totalPages: Math.ceil(countRow.total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteRoadmap = async (req, res) => {
  try {
    await pool.execute('DELETE FROM roadmaps WHERE id = ?', [req.params.id]);
    res.json({ message: 'Roadmap deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Notifications Management ─────────────────────────────────────────────────
exports.getAllNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
      `SELECT n.*, s.full_name as recipient_name
       FROM notifications n LEFT JOIN students s ON n.student_id = s.id
       ORDER BY n.created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [[countRow]] = await pool.execute('SELECT COUNT(*) as total FROM notifications');
    res.json({ data: rows, total: countRow.total, page, totalPages: Math.ceil(countRow.total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.sendBroadcastNotification = async (req, res) => {
  try {
    const { type = 'general', title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required.' });
    }
    await notifyAllStudents(type, title, message, false); // false = skip email for manual broadcasts
    res.status(201).json({ message: 'Broadcast notification sent to all students!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await pool.execute('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notification deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Admin Analytics ──────────────────────────────────────────────────────────
exports.getAdminAnalytics = async (req, res) => {
  try {
    // Summary counts
    const [[students]] = await pool.execute('SELECT COUNT(*) as total FROM students');
    const [[companies]] = await pool.execute('SELECT COUNT(*) as total FROM companies');
    const [[experiences]] = await pool.execute('SELECT COUNT(*) as total FROM interview_experiences');
    const [[reports]] = await pool.execute('SELECT COUNT(*) as total FROM resume_reports');
    const [[roadmaps]] = await pool.execute('SELECT COUNT(*) as total FROM roadmaps');
    const [[admins]] = await pool.execute("SELECT COUNT(*) as total FROM students WHERE role='admin'");
    const [[applications]] = await pool.execute('SELECT COUNT(*) as total FROM student_applications');
    const [[placed]] = await pool.execute("SELECT COUNT(*) as total FROM student_applications WHERE status='Offered'");

    // Monthly registrations – last 6 months
    const [monthlyReg] = await pool.execute(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
      FROM students
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month ORDER BY month ASC
    `);

    // Branch distribution
    const [branchDist] = await pool.execute(`
      SELECT branch, COUNT(*) as count FROM students
      WHERE branch IS NOT NULL AND branch != ''
      GROUP BY branch ORDER BY count DESC LIMIT 8
    `);

    // Role distribution
    const [roleDist] = await pool.execute(`
      SELECT role, COUNT(*) as count FROM students GROUP BY role
    `);

    // Top companies by application count
    const [topCompanies] = await pool.execute(`
      SELECT c.company_name, COUNT(sa.student_id) as applications
      FROM companies c
      LEFT JOIN student_applications sa ON c.id = sa.company_id
      GROUP BY c.id, c.company_name
      ORDER BY applications DESC LIMIT 7
    `);

    // Skill demand from companies
    const [allCompanySkills] = await pool.execute('SELECT required_skills FROM companies WHERE required_skills IS NOT NULL');
    const skillMap = {};
    allCompanySkills.forEach(row => {
      try {
        const skills = typeof row.required_skills === 'string' ? JSON.parse(row.required_skills) : row.required_skills;
        if (Array.isArray(skills)) {
          skills.forEach(s => {
            const clean = s.trim();
            if (clean) skillMap[clean] = (skillMap[clean] || 0) + 1;
          });
        }
      } catch (e) { /* skip */ }
    });
    const topSkills = Object.entries(skillMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({ skill, count }));

    // Difficulty distribution
    const [difficultyDist] = await pool.execute(`
      SELECT difficulty_level, COUNT(*) as count FROM interview_experiences GROUP BY difficulty_level
    `);

    // ATS score distribution
    const [atsScores] = await pool.execute(`
      SELECT
        SUM(ats_score < 40) as poor,
        SUM(ats_score BETWEEN 40 AND 59) as average,
        SUM(ats_score BETWEEN 60 AND 79) as good,
        SUM(ats_score >= 80) as excellent
      FROM resume_reports WHERE ats_score IS NOT NULL
    `);

    res.json({
      summary: {
        total_students: students.total,
        total_companies: companies.total,
        total_experiences: experiences.total,
        total_reports: reports.total,
        total_roadmaps: roadmaps.total,
        total_admins: admins.total,
        total_applications: applications.total,
        total_placed: placed.total,
      },
      charts: {
        monthly_registrations: monthlyReg,
        branch_distribution: branchDist,
        role_distribution: roleDist,
        top_companies: topCompanies,
        top_skills: topSkills.length > 0 ? topSkills : [
          { skill: 'React.js', count: 12 }, { skill: 'Node.js', count: 10 },
          { skill: 'Python', count: 9 }, { skill: 'SQL', count: 8 },
          { skill: 'Java', count: 7 }, { skill: 'DSA', count: 11 },
          { skill: 'AWS', count: 5 }, { skill: 'MongoDB', count: 6 }
        ],
        difficulty_distribution: difficultyDist,
        ats_distribution: atsScores[0] || { poor: 0, average: 0, good: 0, excellent: 0 },
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Admin Company Management ─────────────────────────────────────────────────
const Company = require('../models/Company');

const path = require('path');

exports.getAdminCompanies = async (req, res) => {
  try {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const result = await Company.findAll({ search, page, limit, sort_by: 'created_at', order: 'desc' });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createAdminCompany = async (req, res) => {
  try {
    const companyData = { ...req.body };
    if (req.files && req.files.logo) {
      companyData.company_logo = `/uploads/${req.files.logo[0].filename}`;
    }
    if (typeof companyData.allowed_branches === 'string') {
      try { companyData.allowed_branches = JSON.parse(companyData.allowed_branches); } catch (e) { companyData.allowed_branches = []; }
    }
    if (typeof companyData.required_skills === 'string') {
      try { companyData.required_skills = JSON.parse(companyData.required_skills); } catch (e) { companyData.required_skills = []; }
    }
    const id = await Company.create(companyData);
    notifyAllStudents(
      'new_company',
      `🏢 New Company: ${companyData.company_name}`,
      `${companyData.company_name} is hiring for ${companyData.job_role || 'multiple roles'}. Package: ${companyData.package_lpa || 'Competitive'}. Check eligibility now!`
    );
    res.status(201).json({ message: 'Company created successfully', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAdminCompany = async (req, res) => {
  try {
    const companyData = { ...req.body };
    if (req.files && req.files.logo) {
      companyData.company_logo = `/uploads/${req.files.logo[0].filename}`;
    }
    if (typeof companyData.allowed_branches === 'string') {
      try { companyData.allowed_branches = JSON.parse(companyData.allowed_branches); } catch (e) { companyData.allowed_branches = []; }
    }
    if (typeof companyData.required_skills === 'string') {
      try { companyData.required_skills = JSON.parse(companyData.required_skills); } catch (e) { companyData.required_skills = []; }
    }
    await Company.update(req.params.id, companyData);
    res.json({ message: 'Company updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteAdminCompany = async (req, res) => {
  try {
    await Company.delete(req.params.id);
    res.json({ message: 'Company deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
