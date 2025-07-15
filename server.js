const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import configurations and middleware
const { testConnection } = require('./config/database');
const { createTables } = require('./config/schema');

// Import routes
const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resources');
const bookmarkRoutes = require('./routes/bookmarks');
const feedbackRoutes = require('./routes/feedback');
const miscRoutes = require('./routes/misc');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins for network access
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api', miscRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'College Resource Hub API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large' });
  }
  
  if (err.message === 'File type not allowed') {
    return res.status(400).json({ error: 'File type not allowed' });
  }
  
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const initializeApp = async () => {
  try {
    console.log('🔄 Initializing College Resource Hub Backend...');
    
    // Test database connection
    await testConnection();
    
    // Create database tables
    await createTables();
    
    // Start server on all network interfaces
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📁 File uploads will be stored in: ./uploads`);
      console.log(`🔗 Local API: http://localhost:${PORT}/api`);
      console.log(`🌐 Network API: http://10.80.246.62:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
};

// Start the application
initializeApp();