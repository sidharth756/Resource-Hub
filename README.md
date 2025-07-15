# College Resource Hub

A comprehensive platform for college students and faculty to share and access educational resources with secure authentication and file management.

## 🌟 Features

- **User Authentication**: Registration with OTP email verification
- **Resource Management**: Upload, download, and categorize educational files
- **Bookmarking System**: Save favorite resources for quick access
- **Admin Dashboard**: Content approval and user management
- **Advanced Search**: Filter by department, subject, and category
- **Role-based Access**: Student, Faculty, and Admin permissions

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- MySQL Database
- JWT Authentication
- Multer (File Upload)
- Nodemailer (Email Service)

**Frontend:**
- React.js
- React Router
- Axios
- Lucide React Icons

## 🚀 Quick Setup

### Prerequisites
- Node.js (v14+)
- MySQL Server
- Gmail account for email service

### 1. Clone Repository
```bash
git clone https://github.com/pratheepsivaraman/Quiz-App.git
cd Quiz-App
```

### 2. Backend Setup
```bash
# Install backend dependencies
npm install

# Create MySQL database
mysql -u root -p
CREATE DATABASE college_resource_hub;
exit

# Create .env file in root directory
```

### 3. Environment Configuration
Create `.env` file in root directory:
```env
# Database
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=college_resource_hub

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Email (Gmail App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
```

### 4. Gmail App Password Setup
1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"
4. Use this password in `EMAIL_PASSWORD`

### 5. Start Backend Server
```bash
npm run dev
```
Backend will run on http://localhost:5000

### 6. Frontend Setup
```bash
# Open new terminal and navigate to frontend
cd frontend

# Install frontend dependencies
npm install

# Start React development server
npm start
```
Frontend will run on http://localhost:3000

## 📁 Project Structure
```
Resource-hub/
├── config/           # Database and upload configuration
├── middleware/       # Authentication middleware
├── routes/          # API routes
├── services/        # Email service
├── uploads/         # File storage (auto-created)
├── frontend/        # React application
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── services/
│   └── public/
├── server.js        # Main server file
└── package.json     # Backend dependencies
```

## 🔐 Authentication Flow

1. **Register** → Email OTP sent
2. **Verify OTP** → Account activated
3. **Login** → JWT token issued
4. **Access** → Role-based permissions

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/login` - User login

### Resources
- `GET /api/resources` - List all resources
- `POST /api/resources/upload` - Upload file
- `GET /api/resources/:id/download` - Download file

### Bookmarks
- `GET /api/bookmarks` - User bookmarks
- `POST /api/bookmarks` - Add bookmark
- `DELETE /api/bookmarks/:id` - Remove bookmark

## 🗄️ Database Tables

- **users** - User accounts and profiles
- **otp_verifications** - Email verification codes
- **resources** - Uploaded files metadata
- **bookmarks** - User saved resources

## 🔧 Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in `.env`

2. **Email OTP Not Sending**
   - Confirm Gmail App Password is correct
   - Check EMAIL_USER and EMAIL_PASSWORD in `.env`

3. **File Upload Issues**
   - Ensure `uploads/` directory exists
   - Check file permissions

4. **Frontend Not Loading**
   - Verify both servers are running
   - Check if ports 3000 and 5000 are available

## 🎯 Usage

### For Students:
1. Register with college email
2. Verify account via OTP
3. Browse and download resources
4. Upload study materials
5. Bookmark useful content

### For Admins:
1. Approve uploaded resources
2. Manage user accounts
3. System oversight

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues or questions, please create an issue in the GitHub repository.

