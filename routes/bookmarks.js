const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Add bookmark
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { resourceId } = req.body;
    const userId = req.user.userId;

    // Check if resource exists
    const [resources] = await pool.execute(
      'SELECT id FROM resources WHERE id = ?',
      [resourceId]
    );

    if (resources.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Add bookmark
    await pool.execute(
      'INSERT INTO bookmarks (user_id, resource_id) VALUES (?, ?)',
      [userId, resourceId]
    );

    res.status(201).json({ message: 'Bookmark added successfully' });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Resource already bookmarked' });
    }
    console.error('Add bookmark error:', error);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
});

// Get user's bookmarks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [bookmarks] = await pool.execute(
      `SELECT b.*, r.title, r.description, r.file_name, r.subject, r.department, r.category,
              r.created_at as resource_created_at, u.name as uploader_name
       FROM bookmarks b
       JOIN resources r ON b.resource_id = r.id
       JOIN users u ON r.uploaded_by = u.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.userId]
    );

    res.json(bookmarks);

  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// Remove bookmark
router.delete('/:resourceId', authenticateToken, async (req, res) => {
  try {
    const { resourceId } = req.params;
    const userId = req.user.userId;

    const [result] = await pool.execute(
      'DELETE FROM bookmarks WHERE user_id = ? AND resource_id = ?',
      [userId, resourceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json({ message: 'Bookmark removed successfully' });

  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

module.exports = router;