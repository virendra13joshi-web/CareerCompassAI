const { pool } = require('../config/db');

// ─── Get notifications for current user ───────────────────────────────────────
exports.getMyNotifications = async (req, res) => {
  try {
    const studentId = req.user.id;
    const type = req.query.type || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    let query = `
      SELECT * FROM notifications
      WHERE (student_id = ? OR student_id IS NULL)
    `;
    const values = [studentId];

    if (type) {
      query += ` AND type = ?`;
      values.push(type);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    values.push(limit, offset);

    const [notifications] = await pool.execute(query, values);

    // Count total
    let countQuery = `SELECT COUNT(*) as total FROM notifications WHERE (student_id = ? OR student_id IS NULL)`;
    const countValues = [studentId];
    if (type) {
      countQuery += ` AND type = ?`;
      countValues.push(type);
    }
    const [countRows] = await pool.execute(countQuery, countValues);

    res.json({
      notifications,
      total: countRows[0].total,
      page,
      totalPages: Math.ceil(countRows[0].total / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Get unread count ─────────────────────────────────────────────────────────
exports.getUnreadCount = async (req, res) => {
  try {
    const studentId = req.user.id;
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as count FROM notifications WHERE (student_id = ? OR student_id IS NULL) AND is_read = FALSE`,
      [studentId]
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Mark single notification as read ────────────────────────────────────────
exports.markAsRead = async (req, res) => {
  try {
    await pool.execute(
      `UPDATE notifications SET is_read = TRUE WHERE id = ?`,
      [req.params.id]
    );
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Mark all as read ─────────────────────────────────────────────────────────
exports.markAllAsRead = async (req, res) => {
  try {
    const studentId = req.user.id;
    await pool.execute(
      `UPDATE notifications SET is_read = TRUE WHERE (student_id = ? OR student_id IS NULL) AND is_read = FALSE`,
      [studentId]
    );
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
