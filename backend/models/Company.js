const { pool } = require('../config/db');

const Company = {
  // Create a new company
  create: async (companyData) => {
    const {
      company_name, logo_url, job_role, package, location,
      min_cgpa, allowed_branches, required_skills, hiring_process,
      interview_rounds, previous_questions, application_deadline, official_website
    } = companyData;

    const query = `
        INSERT INTO companies (
          company_name, logo_url, job_role, package, location, 
          min_cgpa, allowed_branches, required_skills, hiring_process, 
          interview_rounds, previous_questions, application_deadline, official_website
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

    const [result] = await pool.execute(query, [
      company_name, logo_url || null, job_role, package || null, location || null,
      min_cgpa || null, JSON.stringify(allowed_branches || []), JSON.stringify(required_skills || []), hiring_process || null,
      interview_rounds || null, previous_questions || null, application_deadline || null, official_website || null
    ]);
    return result.insertId;
  },

  // Update a company
  update: async (id, companyData) => {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(companyData)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        // handle JSON arrays for branches and skills
        if (key === 'allowed_branches' || key === 'required_skills') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
      }
    }

    if (fields.length === 0) return;

    values.push(id);
    const query = `UPDATE companies SET ${fields.join(', ')} WHERE id = ?`;
    await pool.execute(query, values);
  },

  // Delete a company
  delete: async (id) => {
    const query = `DELETE FROM companies WHERE id = ?`;
    await pool.execute(query, [id]);
  },

  // Get company by ID
  findById: async (id) => {
    const query = `SELECT * FROM companies WHERE id = ?`;
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  },

  // Advanced search, filter, sorting, and pagination
  findAll: async ({ search, location, min_cgpa, branch, sort_by, order, page, limit }) => {
    let query = `SELECT * FROM companies WHERE 1=1`;
    const values = [];

    if (search) {
      query += ` AND (company_name LIKE ? OR job_role LIKE ?)`;
      values.push(`%${search}%`, `%${search}%`);
    }

    if (location) {
      query += ` AND location LIKE ?`;
      values.push(`%${location}%`);
    }

    if (min_cgpa) {
      query += ` AND (min_cgpa <= ? OR min_cgpa IS NULL)`;
      values.push(min_cgpa);
    }

    if (branch) {
      // JSON contains search for branch
      query += ` AND JSON_CONTAINS(allowed_branches, ?)`;
      values.push(`"${branch}"`);
    }

    const validSortFields = ['company_name', 'application_deadline', 'created_at', 'min_cgpa'];
    if (sort_by && validSortFields.includes(sort_by)) {
      const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
      query += ` ORDER BY ${sort_by} ${sortOrder}`;
    } else {
      query += ` ORDER BY created_at DESC`;
    }

    page = Number(page) || 1;
    limit = Number(limit) || 9;

    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const offset = (page - 1) * limit;

    // LIMIT aur OFFSET ko direct query me daal do
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await pool.query(query, values);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM companies WHERE 1=1`;
    const countValues = values.slice(0, values.length - 2); // remove limit and offset

    if (search) countQuery += ` AND (company_name LIKE ? OR job_role LIKE ?)`;
    if (location) countQuery += ` AND location LIKE ?`;
    if (min_cgpa) countQuery += ` AND (min_cgpa <= ? OR min_cgpa IS NULL)`;
    if (branch) countQuery += ` AND JSON_CONTAINS(allowed_branches, ?)`;

    const [countRows] = await pool.execute(countQuery, countValues);

    return {
      data: rows,
      total: countRows[0].total,
      page: Number(page),
      totalPages: Math.ceil(countRows[0].total / limit)
    };
  },

  // Bookmark a company
  bookmark: async (studentId, companyId) => {
    const query = `INSERT IGNORE INTO student_bookmarks (student_id, company_id) VALUES (?, ?)`;
    await pool.execute(query, [studentId, companyId]);
  },

  // Remove Bookmark
  removeBookmark: async (studentId, companyId) => {
    const query = `DELETE FROM student_bookmarks WHERE student_id = ? AND company_id = ?`;
    await pool.execute(query, [studentId, companyId]);
  },

  // Get Bookmarks for a student
  getBookmarks: async (studentId) => {
    const query = `SELECT company_id FROM student_bookmarks WHERE student_id = ?`;
    const [rows] = await pool.execute(query, [studentId]);
    return rows.map(r => r.company_id);
  },

  // Apply to a company
  apply: async (studentId, companyId) => {
    const query = `INSERT IGNORE INTO student_applications (student_id, company_id, status) VALUES (?, ?, 'Applied')`;
    await pool.execute(query, [studentId, companyId]);
  },

  // Get Applications for a student
  getApplications: async (studentId) => {
    const query = `
        SELECT sa.*, c.company_name, c.job_role, c.logo_url 
        FROM student_applications sa
        JOIN companies c ON sa.company_id = c.id
        WHERE sa.student_id = ?
      `;
    const [rows] = await pool.execute(query, [studentId]);
    return rows;
  }
};

module.exports = Company;
