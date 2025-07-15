const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Add feedback to a resource
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { resourceId, rating, comment } = req.body;
    const userId = req.user.userId;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if resource exists
    const [resources] = await pool.execute(
      'SELECT id FROM resources WHERE id = ?',
      [resourceId]
    );

    if (resources.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Add feedback
    const [result] = await pool.execute(
      'INSERT INTO feedback (user_id, resource_id, rating, comment) VALUES (?, ?, ?, ?)',
      [userId, resourceId, rating, comment]
    );

    res.status(201).json({
      message: 'Feedback added successfully',
      feedback: {
        id: result.insertId,
        resourceId,
        rating,
        comment,
        userId
      }
    });

  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({ error: 'Failed to add feedback' });
  }
});

// Get feedback for a resource
router.get('/resource/:resourceId', async (req, res) => {
  try {
    const { resourceId } = req.params;

    const [feedback] = await pool.execute(
      `SELECT f.*, u.name as user_name 
       FROM feedback f
       JOIN users u ON f.user_id = u.id
       WHERE f.resource_id = ?
       ORDER BY f.created_at DESC`,
      [resourceId]
    );

    // Calculate average rating
    const avgRating = feedback.length > 0 
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
      : 0;

    res.json({
      feedback,
      averageRating: parseFloat(avgRating.toFixed(1)),
      totalFeedback: feedback.length
    });

  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Get user's feedback
router.get('/user/my-feedback', authenticateToken, async (req, res) => {
  try {
    const [feedback] = await pool.execute(
      `SELECT f.*, r.title as resource_title, r.file_name
       FROM feedback f
       JOIN resources r ON f.resource_id = r.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.userId]
    );

    res.json(feedback);

  } catch (error) {
    console.error('Get user feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch user feedback' });
  }
});

// Update feedback
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if feedback exists and belongs to user
    const [existingFeedback] = await pool.execute(
      'SELECT id FROM feedback WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingFeedback.length === 0) {
      return res.status(404).json({ error: 'Feedback not found or not authorized' });
    }

    // Update feedback
    await pool.execute(
      'UPDATE feedback SET rating = ?, comment = ? WHERE id = ?',
      [rating, comment, id]
    );

    res.json({ message: 'Feedback updated successfully' });

  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

// Delete feedback
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const [result] = await pool.execute(
      'DELETE FROM feedback WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Feedback not found or not authorized' });
    }

    res.json({ message: 'Feedback deleted successfully' });

  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

module.exports = router;