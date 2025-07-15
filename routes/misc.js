const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Newsletter subscription
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Insert subscription
    await pool.execute(
      'INSERT INTO newsletter_subscriptions (email) VALUES (?)',
      [email]
    );

    res.status(201).json({ message: 'Subscribed to newsletter successfully' });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already subscribed' });
    }
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    await pool.execute(
      'UPDATE newsletter_subscriptions SET is_active = FALSE WHERE email = ?',
      [email]
    );

    res.json({ message: 'Unsubscribed successfully' });

  } catch (error) {
    console.error('Newsletter unsubscription error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Get academic calendar events
router.get('/calendar', async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = 'SELECT * FROM academic_calendar WHERE 1=1';
    const params = [];

    if (month && year) {
      query += ' AND MONTH(event_date) = ? AND YEAR(event_date) = ?';
      params.push(month, year);
    }

    query += ' ORDER BY event_date ASC';

    const [events] = await pool.execute(query, params);
    res.json(events);

  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Add calendar event (admin only)
router.post('/calendar', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { title, description, eventDate, eventType } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO academic_calendar (title, description, event_date, event_type, created_by) VALUES (?, ?, ?, ?, ?)',
      [title, description, eventDate, eventType, req.user.userId]
    );

    res.status(201).json({
      message: 'Calendar event created successfully',
      event: {
        id: result.insertId,
        title,
        description,
        eventDate,
        eventType
      }
    });

  } catch (error) {
    console.error('Add calendar event error:', error);
    res.status(500).json({ error: 'Failed to add calendar event' });
  }
});

module.exports = router;