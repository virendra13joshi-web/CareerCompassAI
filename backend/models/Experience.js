const { pool } = require('../config/db');

const Experience = {
  // Create a new interview experience
  create: async (data) => {
    const {
      student_id,
      company_name,
      role,
      interview_date,
      difficulty_level,
      technical_questions,
      hr_questions,
      coding_questions,
      tips
    } = data;

    const query = `
      INSERT INTO interview_experiences
      (
        student_id,
        company_name,
        role,
        interview_date,
        difficulty_level,
        technical_questions,
        hr_questions,
        coding_questions,
        tips
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      student_id,
      company_name,
      role,
      interview_date || null,
      difficulty_level || 'Medium',
      technical_questions || null,
      hr_questions || null,
      coding_questions || null,
      tips || null
    ]);

    return result.insertId;
  },

  // Get all interview experiences
  findAll: async ({
    search,
    difficulty,
    page = 1,
    limit = 9,
    currentStudentId = null
  }) => {
    let query = `
      SELECT
        ie.*,
        s.full_name AS author_name,
        s.branch AS author_branch,
        s.college AS author_college,

        (
          SELECT COUNT(*)
          FROM experience_likes
          WHERE experience_id = ie.id
        ) AS likes_count,

        (
          SELECT COUNT(*)
          FROM experience_comments
          WHERE experience_id = ie.id
        ) AS comments_count
    `;

    // Check whether current student has liked the experience
    if (currentStudentId) {
      query += `,
        (
          SELECT COUNT(*) > 0
          FROM experience_likes
          WHERE experience_id = ie.id
          AND student_id = ${pool.escape(currentStudentId)}
        ) AS is_liked
      `;
    } else {
      query += `,
        FALSE AS is_liked
      `;
    }

    query += `
      FROM interview_experiences ie
      LEFT JOIN students s
        ON ie.student_id = s.id
      WHERE 1 = 1
    `;

    const values = [];

    // Search filter
    if (search) {
      query += `
        AND (
          ie.company_name LIKE ?
          OR ie.role LIKE ?
          OR ie.technical_questions LIKE ?
          OR ie.tips LIKE ?
        )
      `;

      const searchValue = `%${search}%`;

      values.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue
      );
    }

    // Difficulty filter
    if (difficulty) {
      query += `
        AND ie.difficulty_level = ?
      `;

      values.push(difficulty);
    }

    // Safe pagination values
    const safePage = Math.max(1, parseInt(page) || 1);
    const safeLimit = Math.min(
      100,
      Math.max(1, parseInt(limit) || 9)
    );

    const offset = (safePage - 1) * safeLimit;

    /*
      IMPORTANT:
      LIMIT/OFFSET are inserted as validated numbers
      instead of using ? placeholders.
      This fixes MySQL ER_WRONG_ARGUMENTS (1210).
    */
    query += `
      ORDER BY ie.created_at DESC
      LIMIT ${safeLimit} OFFSET ${offset}
    `;

    // Get experiences
    const [rows] = await pool.execute(query, values);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) AS total
      FROM interview_experiences ie
      WHERE 1 = 1
    `;

    const countValues = [];

    // Same search filter for count
    if (search) {
      countQuery += `
        AND (
          ie.company_name LIKE ?
          OR ie.role LIKE ?
          OR ie.technical_questions LIKE ?
          OR ie.tips LIKE ?
        )
      `;

      const searchValue = `%${search}%`;

      countValues.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue
      );
    }

    // Same difficulty filter for count
    if (difficulty) {
      countQuery += `
        AND ie.difficulty_level = ?
      `;

      countValues.push(difficulty);
    }

    const [countRows] = await pool.execute(
      countQuery,
      countValues
    );

    const total = Number(
      countRows[0]?.total || 0
    );

    return {
      data: rows,
      total,
      page: safePage,
      totalPages: Math.ceil(total / safeLimit)
    };
  },

  // Get single interview experience
  findById: async (
    id,
    currentStudentId = null
  ) => {
    let query = `
      SELECT
        ie.*,
        s.full_name AS author_name,
        s.branch AS author_branch,
        s.college AS author_college,

        (
          SELECT COUNT(*)
          FROM experience_likes
          WHERE experience_id = ie.id
        ) AS likes_count,

        (
          SELECT COUNT(*)
          FROM experience_comments
          WHERE experience_id = ie.id
        ) AS comments_count
    `;

    if (currentStudentId) {
      query += `,
        (
          SELECT COUNT(*) > 0
          FROM experience_likes
          WHERE experience_id = ie.id
          AND student_id = ${pool.escape(currentStudentId)}
        ) AS is_liked
      `;
    } else {
      query += `,
        FALSE AS is_liked
      `;
    }

    query += `
      FROM interview_experiences ie
      LEFT JOIN students s
        ON ie.student_id = s.id
      WHERE ie.id = ?
    `;

    const [rows] = await pool.execute(
      query,
      [id]
    );

    return rows[0];
  },

  // Like / Unlike experience
  toggleLike: async (
    studentId,
    experienceId
  ) => {
    const [existing] = await pool.execute(
      `
        SELECT *
        FROM experience_likes
        WHERE student_id = ?
        AND experience_id = ?
      `,
      [studentId, experienceId]
    );

    if (existing.length > 0) {
      await pool.execute(
        `
          DELETE FROM experience_likes
          WHERE student_id = ?
          AND experience_id = ?
        `,
        [studentId, experienceId]
      );

      return false;
    } else {
      await pool.execute(
        `
          INSERT INTO experience_likes
          (student_id, experience_id)
          VALUES (?, ?)
        `,
        [studentId, experienceId]
      );

      return true;
    }
  },

  // Add comment
  addComment: async (
    studentId,
    experienceId,
    comment
  ) => {
    const [result] = await pool.execute(
      `
        INSERT INTO experience_comments
        (student_id, experience_id, comment)
        VALUES (?, ?, ?)
      `,
      [
        studentId,
        experienceId,
        comment
      ]
    );

    return result.insertId;
  },

  // Get comments
  getComments: async (
    experienceId
  ) => {
    const [rows] = await pool.execute(
      `
        SELECT
          ec.*,
          s.full_name AS author_name
        FROM experience_comments ec
        JOIN students s
          ON ec.student_id = s.id
        WHERE ec.experience_id = ?
        ORDER BY ec.created_at ASC
      `,
      [experienceId]
    );

    return rows;
  }
};

module.exports = Experience;