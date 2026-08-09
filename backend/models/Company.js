const { pool } = require('../config/db');

const Company = {
  // Create a new company
  create: async (companyData) => {
    const {
      company_name, company_logo, job_role, package_lpa, location,
      eligibility_cgpa, allowed_branches, required_skills, hiring_process,
      interview_rounds, previous_questions, application_deadline, company_website,
      max_backlogs, allowed_graduation_years, work_mode, bond_period,
      minimum_10th_percentage, minimum_12th_percentage,
      // Accept legacy field names as fallbacks
      logo_url, package: pkg, min_cgpa, official_website
    } = companyData;

    const resolvedLogo = company_logo || logo_url || null;
    const resolvedPackage = package_lpa || pkg || null;
    const resolvedCgpa = eligibility_cgpa || min_cgpa || null;
    const resolvedWebsite = company_website || official_website || null;

    const query = `
        INSERT INTO companies (
          company_name, company_logo, job_role, package_lpa, location, 
          eligibility_cgpa, allowed_branches, required_skills, hiring_process, 
          interview_rounds, previous_questions, application_deadline, company_website,
          max_backlogs, allowed_graduation_years, work_mode, bond_period,
          minimum_10th_percentage, minimum_12th_percentage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

    const [result] = await pool.execute(query, [
      company_name, resolvedLogo, job_role, resolvedPackage, location || null,
      resolvedCgpa, JSON.stringify(allowed_branches || []), JSON.stringify(required_skills || []), hiring_process || null,
      interview_rounds || null, previous_questions || null, application_deadline || null, resolvedWebsite,
      max_backlogs || 0, JSON.stringify(allowed_graduation_years || []), work_mode || null, bond_period || null,
      minimum_10th_percentage || null, minimum_12th_percentage || null
    ]);
    return result.insertId;
  },

  // Update a company
  update: async (id, companyData) => {
    const fields = [];
    const values = [];

    // Normalise legacy field names to live DB column names
    const fieldMap = {
      logo_url: 'company_logo',
      package: 'package_lpa',
      min_cgpa: 'eligibility_cgpa',
      official_website: 'company_website'
    };

    for (let [key, value] of Object.entries(companyData)) {
      if (value !== undefined) {
        // Remap legacy keys to real column names
        const col = fieldMap[key] || key;
        fields.push(`${col} = ?`);
        if (col === 'allowed_branches' || col === 'required_skills' || col === 'allowed_graduation_years') {
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
      query += ` AND (eligibility_cgpa <= ? OR eligibility_cgpa IS NULL)`;
      values.push(min_cgpa);
    }

    if (branch) {
      query += ` AND JSON_CONTAINS(allowed_branches, ?)`;
      values.push(`"${branch}"`);
    }

    // Map legacy sort field names to real column names
    const sortFieldMap = {
      min_cgpa: 'eligibility_cgpa',
      logo_url: 'company_logo',
      package: 'package_lpa',
      official_website: 'company_website'
    };
    const validSortFields = ['company_name', 'application_deadline', 'created_at', 'eligibility_cgpa', 'package_lpa'];
    const resolvedSort = sortFieldMap[sort_by] || sort_by;

    if (resolvedSort && validSortFields.includes(resolvedSort)) {
      const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
      query += ` ORDER BY ${resolvedSort} ${sortOrder}`;
    } else {
      query += ` ORDER BY created_at DESC`;
    }

    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const offset = (page - 1) * limit;

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await pool.query(query, values);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM companies WHERE 1=1`;
    const countValues = [...values];

    if (search) countQuery += ` AND (company_name LIKE ? OR job_role LIKE ?)`;
    if (location) countQuery += ` AND location LIKE ?`;
    if (min_cgpa) countQuery += ` AND (eligibility_cgpa <= ? OR eligibility_cgpa IS NULL)`;
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
        SELECT sa.*, c.company_name, c.job_role, c.company_logo 
        FROM student_applications sa
        JOIN companies c ON sa.company_id = c.id
        WHERE sa.student_id = ?
      `;
    const [rows] = await pool.execute(query, [studentId]);
    return rows;
  }
};

module.exports = Company;

