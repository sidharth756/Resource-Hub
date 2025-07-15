const { pool } = require('./config/database');

// Migration script to add missing columns to existing tables
const migrateDatabase = async () => {
  console.log('🔄 Starting database migration...');
  
  try {
    // Check if is_verified column exists in users table
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'college_resource_hub' 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'is_verified'
    `);

    if (columns.length === 0) {
      console.log('📝 Adding is_verified column to users table...');
      await pool.execute(`
        ALTER TABLE users 
        ADD COLUMN is_verified BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Added is_verified column to users table');
    } else {
      console.log('✅ is_verified column already exists in users table');
    }

    // Check if otp_verifications table exists
    const [tables] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'college_resource_hub' 
      AND TABLE_NAME = 'otp_verifications'
    `);

    if (tables.length === 0) {
      console.log('📝 Creating otp_verifications table...');
      await pool.execute(`
        CREATE TABLE otp_verifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          otp VARCHAR(6) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_otp (otp),
          INDEX idx_expires (expires_at)
        )
      `);
      console.log('✅ Created otp_verifications table');
    } else {
      console.log('✅ otp_verifications table already exists');
    }

    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Database migration failed:', error.message);
    throw error;
  }
};

// Run migration
migrateDatabase()
  .then(() => {
    console.log('✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });