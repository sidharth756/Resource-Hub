const nodemailer = require('nodemailer');

// Create transporter with the same configuration that works in the test
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

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
  try {
    const mailOptions = {
      from: {
        name: 'College Resource Hub',
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: 'Verify Your Account - College Resource Hub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .otp-box { background: #f8f9fa; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 10px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 College Resource Hub</h1>
              <p>Account Verification</p>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for registering with College Resource Hub. To complete your account verification, please use the OTP code below:</p>
              
              <div class="otp-box">
                <p>Your verification code is:</p>
                <div class="otp-code">${otp}</div>
                <p><strong>This code expires in 10 minutes</strong></p>
              </div>
              
              <p>Please enter this code on the verification page to activate your account.</p>
              <p>If you didn't request this verification, please ignore this email.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p><strong>Security Tips:</strong></p>
                <ul style="text-align: left; color: #666;">
                  <li>Never share your OTP with anyone</li>
                  <li>We will never ask for your OTP via phone or email</li>
                  <li>This code is valid for 10 minutes only</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 College Resource Hub. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after successful verification
const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: {
        name: 'College Resource Hub',
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: 'Welcome to College Resource Hub!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .feature-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .btn { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to College Resource Hub!</h1>
              <p>Your account has been successfully verified</p>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Congratulations! Your account has been successfully verified and you're now part of the College Resource Hub community.</p>
              
              <h3>What you can do now:</h3>
              <div class="feature-box">
                <h4>📚 Access Resources</h4>
                <p>Browse and download study materials, assignments, and notes shared by your peers.</p>
              </div>
              
              <div class="feature-box">
                <h4>📤 Upload Content</h4>
                <p>Share your own study materials and help other students in your department.</p>
              </div>
              
              <div class="feature-box">
                <h4>🔖 Bookmark Favorites</h4>
                <p>Save useful resources for quick access later.</p>
              </div>
              
              <div class="feature-box">
                <h4>📅 Stay Organized</h4>
                <p>Use the calendar feature to keep track of important academic events.</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="btn">Get Started</a>
              </div>
              
              <p>If you have any questions or need help, feel free to reach out to our support team.</p>
            </div>
            <div class="footer">
              <p>© 2025 College Resource Hub. All rights reserved.</p>
              <p>Happy learning! 🎓</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully to:', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
};