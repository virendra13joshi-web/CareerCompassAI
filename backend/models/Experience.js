const { pool } = require('../config/db');

const Experience = {
  create: async (data) => {
    const {
      student_id, company_name, role, interview_date,
      difficulty_level, technical_questions, hr_questions,
      coding_questions, tips
    } = data;

    const query = `
      INSERT INTO interview_experiences 
      (student_id, company_name, role, interview_date, difficulty_level, technical_questions, hr_questions, coding_questions, tips)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      student_id, company_name, role, interview_date || null,
      difficulty_level || 'Medium', technical_questions || null,
      hr_questions || null, coding_questions || null, tips || null
    ]);

    return result.insertId;
  },

  findAll: async ({ search, difficulty, page = 1, limit = 9, currentStudentId = null }) => {
    let query = `
      SELECT ie.*, s.full_name as author_name, s.branch as author_branch, s.college as author_college,
             (SELECT COUNT(*) FROM experience_likes WHERE experience_id = ie.id) as likes_count,
             (SELECT COUNT(*) FROM experience_comments WHERE experience_id = ie.id) as comments_count
      `;

    if (currentStudentId) {
      query += `, (SELECT COUNT(*) > 0 FROM experience_likes WHERE experience_id = ie.id AND student_id = ${pool.escape(currentStudentId)}) as is_liked`;
    } else {
      query += `, FALSE as is_liked`;
    }

    query += ` FROM interview_experiences ie LEFT JOIN students s ON ie.student_id = s.id WHERE 1=1`;

    const values = [];

    if (search) {
      query += ` AND (ie.company_name LIKE ? OR ie.role LIKE ? OR ie.technical_questions LIKE ? OR ie.tips LIKE ?)`;
      values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (difficulty) {
      query += ` AND ie.difficulty_level = ?`;
      values.push(difficulty);
    }

    query += ` ORDER BY ie.created_at DESC`;

    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    values.push(Number(limit), Number(offset));

    const [rows] = await pool.execute(query, values);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM interview_experiences ie WHERE 1=1`;
    const countValues = values.slice(0, values.length - 2);

    if (search) countQuery += ` AND (ie.company_name LIKE ? OR ie.role LIKE ? OR ie.technical_questions LIKE ? OR ie.tips LIKE ?)`;
    if (difficulty) countQuery += ` AND ie.difficulty_level = ?`;

    const [countRows] = await pool.execute(countQuery, countValues);

    return {
      data: rows,
      total: countRows[0].total,
      page: Number(page),
      totalPages: Math.ceil(countRows[0].total / limit)
    };
  },

  findById: async (id, currentStudentId = null) => {
    let query = `
      SELECT ie.*, s.full_name as author_name, s.branch as author_branch, s.college as author_college,
             (SELECT COUNT(*) FROM experience_likes WHERE experience_id = ie.id) as likes_count,
             (SELECT COUNT(*) FROM experience_comments WHERE experience_id = ie.id) as comments_count
      `;

    if (currentStudentId) {
      query += `, (SELECT COUNT(*) > 0 FROM experience_likes WHERE experience_id = ie.id AND student_id = ${pool.escape(currentStudentId)}) as is_liked`;
    } else {
      query += `, FALSE as is_liked`;
    }

    query += ` FROM interview_experiences ie LEFT JOIN students s ON ie.student_id = s.id WHERE ie.id = ?`;

    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  },

  toggleLike: async (studentId, experienceId) => {
    const [existing] = await pool.execute(
      `SELECT * FROM experience_likes WHERE student_id = ? AND experience_id = ?`,
      [studentId, experienceId]
    );

    if (existing.length > 0) {
      await pool.execute(
        `DELETE FROM experience_likes WHERE student_id = ? AND experience_id = ?`,
        [studentId, experienceId]
      );
      return false; // unliked
    } else {
      await pool.execute(
        `INSERT INTO experience_likes (student_id, experience_id) VALUES (?, ?)`,
        [studentId, experienceId]
      );
      return true; // liked
    }
  },

  addComment: async (studentId, experienceId, comment) => {
    const [result] = await pool.execute(
      `INSERT INTO experience_comments (student_id, experience_id, comment) VALUES (?, ?, ?)`,
      [studentId, experienceId, comment]
    );
    return result.insertId;
  },

  getComments: async (experienceId) => {
    const [rows] = await pool.execute(
      `SELECT ec.*, s.full_name as author_name
       FROM experience_comments ec
       JOIN students s ON ec.student_id = s.id
       WHERE ec.experience_id = ?
       ORDER BY ec.created_at ASC`,
      [experienceId]
    );
    return rows;
  }
};

module.exports = Experience;
