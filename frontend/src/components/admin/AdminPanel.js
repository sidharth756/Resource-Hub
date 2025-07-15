import React, { useState, useEffect } from 'react';
import { resourcesAPI } from '../../services/api';
import { Users, FileText, CheckCircle, XCircle, Calendar, Settings } from 'lucide-react';

const AdminPanel = () => {
  const [pendingResources, setPendingResources] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalResources: 0,
    pendingApprovals: 0,
    totalDownloads: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // In a real app, you would have admin-specific endpoints
      const resourcesResponse = await resourcesAPI.getAll();
      const allResources = resourcesResponse.data;
      
      // Filter pending resources (assuming we add this field)
      const pending = allResources.filter(resource => !resource.is_approved);
      setPendingResources(pending);
      
      setStats({
        totalUsers: 120, // Mock data - would come from admin API
        totalResources: allResources.length,
        pendingApprovals: pending.length,
        totalDownloads: allResources.reduce((sum, r) => sum + (r.download_count || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveResource = async (resourceId, isApproved) => {
    try {
      await resourcesAPI.approve(resourceId, isApproved);
      setPendingResources(prev => 
        prev.filter(resource => resource.id !== resourceId)
      );
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1,
        totalResources: isApproved ? prev.totalResources + 1 : prev.totalResources
      }));
    } catch (error) {
      console.error('Error updating resource approval:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>Manage resources, users, and system settings</p>
      </div>

      {/* Stats Overview */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#007bff' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#28a745' }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalResources}</h3>
            <p>Total Resources</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ffc107' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.pendingApprovals}</h3>
            <p>Pending Approvals</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#6f42c1' }}>
            <Settings size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalDownloads}</h3>
            <p>Total Downloads</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Approvals ({stats.pendingApprovals})
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          System Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'pending' && (
          <div className="pending-resources">
            <h2>Pending Resource Approvals</h2>
            
            {pendingResources.length === 0 ? (
              <div className="no-pending">
                <CheckCircle size={64} />
                <h3>No pending approvals</h3>
                <p>All resources have been reviewed</p>
              </div>
            ) : (
              <div className="pending-list">
                {pendingResources.map(resource => (
                  <div key={resource.id} className="pending-card">
                    <div className="pending-info">
                      <h3>{resource.title}</h3>
                      <p className="pending-description">{resource.description}</p>
                      <div className="pending-meta">
                        <span><strong>Uploader:</strong> {resource.uploader_name}</span>
                        <span><strong>Department:</strong> {resource.department}</span>
                        <span><strong>Subject:</strong> {resource.subject}</span>
                        <span><strong>Category:</strong> {resource.category}</span>
                        <span><strong>Uploaded:</strong> {formatDate(resource.created_at)}</span>
                      </div>
                    </div>
                    <div className="pending-actions">
                      <button
                        onClick={() => handleApproveResource(resource.id, true)}
                        className="btn btn-success"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproveResource(resource.id, false)}
                        className="btn btn-danger"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="user-management">
            <h2>User Management</h2>
            <div className="feature-placeholder">
              <Users size={64} />
              <h3>User Management</h3>
              <p>This feature will be available in the next update</p>
              <p>Features coming soon:</p>
              <ul>
                <li>View all users</li>
                <li>Manage user roles</li>
                <li>Ban/unban users</li>
                <li>Send notifications</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="system-settings">
            <h2>System Settings</h2>
            <div className="feature-placeholder">
              <Settings size={64} />
              <h3>System Settings</h3>
              <p>This feature will be available in the next update</p>
              <p>Settings coming soon:</p>
              <ul>
                <li>File upload limits</li>
                <li>Email notifications</li>
                <li>Security settings</li>
                <li>Backup configuration</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;