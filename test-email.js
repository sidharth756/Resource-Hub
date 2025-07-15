const nodemailer = require('nodemailer');
require('dotenv').config();

// Test email configuration
const testEmailConfig = async () => {
  console.log('🔍 Testing email configuration...');
  console.log('Email User:', process.env.EMAIL_USER);
  console.log('Email Password:', process.env.EMAIL_PASSWORD ? '***hidden***' : 'NOT SET');
  
  // Create transporter with more detailed configuration
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    // Verify connection configuration
    console.log('🔗 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    // Send a test email
    console.log('📧 Sending test email...');
    const testMailOptions = {
      from: {
        name: 'College Resource Hub',
        address: process.env.EMAIL_USER,
      },
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'Test Email - College Resource Hub',
      html: `
        <h2>🎉 Email Service Test Successful!</h2>
        <p>Your nodemailer configuration is working correctly.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
        <p>This means your OTP emails should work now!</p>
      `
    };

    const info = await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('✅ Email service is working correctly!');
    
  } catch (error) {
    console.error('❌ Email configuration test failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide specific troubleshooting based on error
    if (error.code === 'EAUTH') {
      console.log('\n🔧 TROUBLESHOOTING STEPS:');
      console.log('1. Make sure 2-Factor Authentication is enabled on your Gmail account');
      console.log('2. Generate a new App Password:');
      console.log('   - Go to Google Account Settings → Security');
      console.log('   - Click "App passwords"');
      console.log('   - Select "Mail" and generate a new password');
      console.log('   - Use the 16-character password (no spaces)');
      console.log('3. Make sure you\'re using the correct Gmail address');
      console.log('4. Try using a different Gmail account if the issue persists');
    }
  }
};

// Run the test
testEmailConfig();