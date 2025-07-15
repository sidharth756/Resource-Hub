const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../config/upload');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Upload a new resource
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { title, description, subject, department, category } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate required fields
    if (!title || !subject || !department || !category) {
      return res.status(400).json({ error: 'Missing required fields: title, subject, department, category' });
    }

    // Check if user exists in database
    const [userCheck] = await pool.execute('SELECT id FROM users WHERE id = ?', [req.user.userId]);
    if (userCheck.length === 0) {
      return res.status(400).json({ error: 'User not found. Please login again.' });
    }

    console.log('Upload attempt by user:', req.user.userId);
    console.log('File details:', {
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
      path: file.path
    });

    // Insert resource into database with auto-approval
    const [result] = await pool.execute(
      `INSERT INTO resources (title, description, file_name, file_path, file_size, file_type, 
       subject, department, uploaded_by, category, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        file.originalname,
        file.path,
        file.size,
        file.mimetype,
        subject,
        department,
        req.user.userId,
        category,
        true  // Auto-approve uploads
      ]
    );

    console.log('Resource created successfully with ID:', result.insertId);

    res.status(201).json({
      message: 'Resource uploaded successfully',
      resource: {
        id: result.insertId,
        title,
        description,
        fileName: file.originalname,
        fileSize: file.size,
        subject,
        department,
        category,
        uploadedBy: req.user.userId
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Delete uploaded file if database insertion fails
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Cleaned up uploaded file due to error');
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    // Return specific error messages
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Invalid user. Please login again.' });
    }
    
    res.status(500).json({ error: 'Upload failed. Please try again.' });
  }
});

// Get all resources with filtering
router.get('/', async (req, res) => {
  try {
    const { department, subject, category, search } = req.query;
    let query = `
      SELECT r.*, u.name as uploader_name, u.role as uploader_role
      FROM resources r
      JOIN users u ON r.uploaded_by = u.id
      WHERE r.is_approved = TRUE
    `;
    const params = [];

    // Add filters
    if (department) {
      query += ' AND r.department = ?';
      params.push(department);
    }
    if (subject) {
      query += ' AND r.subject = ?';
      params.push(subject);
    }
    if (category) {
      query += ' AND r.category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (r.title LIKE ? OR r.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY r.created_at DESC';

    const [resources] = await pool.execute(query, params);
    res.json(resources);

  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Get a specific resource
router.get('/:id', async (req, res) => {
  try {
    const [resources] = await pool.execute(
      `SELECT r.*, u.name as uploader_name, u.role as uploader_role
       FROM resources r
       JOIN users u ON r.uploaded_by = u.id
       WHERE r.id = ?`,
      [req.params.id]
    );

    if (resources.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(resources[0]);

  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// Download a resource
router.get('/:id/download', async (req, res) => {
  try {
    const [resources] = await pool.execute(
      'SELECT * FROM resources WHERE id = ?',
      [req.params.id]
    );

    if (resources.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const resource = resources[0];
    const filePath = path.resolve(resource.file_path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Increment download count
    await pool.execute(
      'UPDATE resources SET download_count = download_count + 1 WHERE id = ?',
      [req.params.id]
    );

    // Send file
    res.download(filePath, resource.file_name);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Get user's uploaded resources
router.get('/user/my-uploads', authenticateToken, async (req, res) => {
  try {
    const [resources] = await pool.execute(
      'SELECT * FROM resources WHERE uploaded_by = ? ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json(resources);

  } catch (error) {
    console.error('Get user uploads error:', error);
    res.status(500).json({ error: 'Failed to fetch user uploads' });
  }
});

// Approve/Reject resource (admin only)
router.patch('/:id/approve', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { isApproved } = req.body;
    await pool.execute(
      'UPDATE resources SET is_approved = ? WHERE id = ?',
      [isApproved, req.params.id]
    );

    res.json({ message: 'Resource approval status updated' });

  } catch (error) {
    console.error('Approve resource error:', error);
    res.status(500).json({ error: 'Failed to update approval status' });
  }
});

module.exports = router;