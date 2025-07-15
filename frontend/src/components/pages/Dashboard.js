import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { resourcesAPI, bookmarksAPI, feedbackAPI } from '../../services/api';
import { BookOpen, Upload, Bookmark, Star, TrendingUp, Users, Calendar, Settings } from 'lucide-react';

const Dashboard = () => {
  const { user, isAdmin, isFaculty } = useAuth();
  const [stats, setStats] = useState({
    myUploads: 0,
    myBookmarks: 0,
    myFeedback: 0,
    totalDownloads: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's uploads
      const uploadsResponse = await resourcesAPI.getMyUploads();
      const uploads = uploadsResponse.data;
      
      // Fetch user's bookmarks
      const bookmarksResponse = await bookmarksAPI.getAll();
      const bookmarks = bookmarksResponse.data;
      
      // Fetch user's feedback
      const feedbackResponse = await feedbackAPI.getMyFeedback();
      const feedback = feedbackResponse.data;
      
      // Calculate total downloads from user's uploads
      const totalDownloads = uploads.reduce((sum, upload) => sum + upload.download_count, 0);
      
      setStats({
        myUploads: uploads.length,
        myBookmarks: bookmarks.length,
        myFeedback: feedback.length,
        totalDownloads
      });
      
      // Create recent activity (combine uploads and bookmarks)
      const activities = [
        ...uploads.slice(0, 3).map(upload => ({
          type: 'upload',
          title: upload.title,
          date: upload.created_at,
          description: `Uploaded ${upload.file_name}`
        })),
        ...bookmarks.slice(0, 3).map(bookmark => ({
          type: 'bookmark',
          title: bookmark.title,
          date: bookmark.created_at,
          description: `Bookmarked resource`
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
      
      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: <BookOpen size={30} />, title: 'Browse Resources', link: '/resources', color: '#007bff' },
    { icon: <Upload size={30} />, title: 'Upload Material', link: '/upload', color: '#28a745' },
    { icon: <Bookmark size={30} />, title: 'My Bookmarks', link: '/bookmarks', color: '#ffc107' },
    { icon: <Calendar size={30} />, title: 'Academic Calendar', link: '/calendar', color: '#6f42c1' },
  ];

  if (isAdmin) {
    quickActions.push({ icon: <Settings size={30} />, title: 'Admin Panel', link: '/admin', color: '#dc3545' });
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="full-width-container">
      <div className="content-container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Here's your activity overview</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#007bff' }}>
              <Upload size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.myUploads}</h3>
              <p>My Uploads</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#ffc107' }}>
              <Bookmark size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.myBookmarks}</h3>
              <p>Bookmarks</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#28a745' }}>
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.totalDownloads}</h3>
              <p>Total Downloads</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#6f42c1' }}>
              <Star size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.myFeedback}</h3>
              <p>Reviews Given</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <Link 
                key={index} 
                to={action.link} 
                className="quick-action-card"
                style={{ borderColor: action.color }}
              >
                <div className="action-icon" style={{ color: action.color }}>
                  {action.icon}
                </div>
                <h3>{action.title}</h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'upload' ? <Upload size={20} /> : <Bookmark size={20} />}
                  </div>
                  <div className="activity-content">
                    <h4>{activity.title}</h4>
                    <p>{activity.description}</p>
                    <small>{new Date(activity.date).toLocaleDateString()}</small>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activity">
                <p>No recent activity</p>
                <Link to="/resources" className="btn btn-primary">
                  Start browsing resources
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Role-specific sections */}
        {(isFaculty || isAdmin) && (
          <div className="dashboard-section">
            <h2>Faculty Tools</h2>
            <div className="faculty-tools">
              <Link to="/upload" className="tool-card">
                <Upload size={24} />
                <span>Upload Course Material</span>
              </Link>
              <Link to="/calendar" className="tool-card">
                <Calendar size={24} />
                <span>Manage Calendar</span>
              </Link>
              {isAdmin && (
                <Link to="/admin" className="tool-card">
                  <Settings size={24} />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;