import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, Mail, Building, Shield, Edit, Save, X, Camera, 
  MapPin, Calendar, Phone, Globe, Award, Settings,
  CheckCircle, AlertCircle, Clock
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    website: user?.website || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        website: user.website || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would make an API call to update the user profile
      console.log('Saving profile data:', formData);
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || '',
      website: user?.website || ''
    });
    setIsEditing(false);
    setMessage({ text: '', type: '' });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'faculty': return '#10b981';
      case 'student': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Settings size={16} />;
      case 'faculty': return <Award size={16} />;
      case 'student': return <User size={16} />;
      default: return <Shield size={16} />;
    }
  };

  const getJoinedDate = () => {
    // In a real app, this would come from user data
    const date = new Date();
    date.setMonth(date.getMonth() - 3); // Simulate 3 months ago
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="full-width-container">
      <div className="content-container">
        {/* Compact Profile Header */}
        <div className="profile-header-neat">
          <div className="profile-avatar-section">
            <div className="profile-avatar-neat">
              <User size={32} />
            </div>
            <button className="avatar-edit-btn-neat" title="Change Profile Picture">
              <Camera size={12} />
            </button>
          </div>
          
          <div className="profile-info-section">
            <div className="profile-basic-info">
              <h1 className="profile-name-neat">{user?.name}</h1>
              <div className="profile-role-info">
                <div 
                  className="role-badge-neat"
                  style={{ backgroundColor: getRoleBadgeColor(user?.role) }}
                >
                  {getRoleIcon(user?.role)}
                  <span>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</span>
                </div>
                <div className="joined-info">
                  <Calendar size={12} />
                  <span>{getJoinedDate()}</span>
                </div>
              </div>
            </div>
            
            <div className="profile-stats-neat">
              <div className="stat-neat">
                <span className="stat-number-neat">12</span>
                <span className="stat-label-neat">Resources</span>
              </div>
              <div className="stat-neat">
                <span className="stat-number-neat">5</span>
                <span className="stat-label-neat">Bookmarks</span>
              </div>
              <div className="stat-neat">
                <span className="stat-number-neat">8</span>
                <span className="stat-label-neat">Downloads</span>
              </div>
            </div>
          </div>
          
          <div className="profile-actions-neat">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary btn-neat"
              >
                <Edit size={14} />
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions-neat">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn btn-success btn-neat"
                >
                  {loading ? <Clock size={14} className="spinning" /> : <Save size={14} />}
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="btn btn-secondary btn-neat"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`alert alert-${message.type} alert-neat`}>
            {message.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {message.text}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="profile-content-grid">
          {/* Personal Information */}
          <div className="profile-card-neat">
            <div className="card-header-neat">
              <h3>Personal Information</h3>
            </div>
            
            <div className="form-fields-neat">
              <div className="field-row-neat">
                <div className="field-neat">
                  <label className="field-label-neat">
                    <User size={14} />
                    Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="field-input-neat"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="field-value-neat">{user?.name || 'Not specified'}</div>
                  )}
                </div>

                <div className="field-neat">
                  <label className="field-label-neat">
                    <Mail size={14} />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="field-input-neat"
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className="field-value-neat">{user?.email}</div>
                  )}
                </div>
              </div>

              <div className="field-row-neat">
                <div className="field-neat">
                  <label className="field-label-neat">
                    <Building size={14} />
                    Department
                  </label>
                  {isEditing ? (
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="field-select-neat"
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Business Administration">Business Administration</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="field-value-neat">{user?.department || 'Not specified'}</div>
                  )}
                </div>

                <div className="field-neat">
                  <label className="field-label-neat">
                    <Phone size={14} />
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="field-input-neat"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <div className="field-value-neat">{formData.phone || 'Not specified'}</div>
                  )}
                </div>
              </div>

              {(isEditing || formData.bio) && (
                <div className="field-full-neat">
                  <label className="field-label-neat">
                    <User size={14} />
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="field-textarea-neat"
                      placeholder="Tell us about yourself..."
                      rows="2"
                    />
                  ) : (
                    <div className="field-value-neat bio-neat">{formData.bio}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Account Details & Quick Actions */}
          <div className="profile-sidebar-neat">
            {/* Account Information */}
            <div className="profile-card-neat">
              <div className="card-header-neat">
                <h3>Account Details</h3>
              </div>
              
              <div className="account-info-neat">
                <div className="account-item-neat">
                  <Shield size={14} />
                  <div className="account-detail-neat">
                    <span className="account-label-neat">Role</span>
                    <div 
                      className="role-badge-mini-neat"
                      style={{ backgroundColor: getRoleBadgeColor(user?.role) }}
                    >
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    </div>
                  </div>
                </div>

                <div className="account-item-neat">
                  <Calendar size={14} />
                  <div className="account-detail-neat">
                    <span className="account-label-neat">Member Since</span>
                    <span className="account-value-neat">{getJoinedDate()}</span>
                  </div>
                </div>

                <div className="account-item-neat">
                  <CheckCircle size={14} />
                  <div className="account-detail-neat">
                    <span className="account-label-neat">Status</span>
                    <span className="status-active-neat">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="profile-card-neat">
              <div className="card-header-neat">
                <h3>Quick Actions</h3>
              </div>
              
              <div className="actions-neat">
                <button className="action-btn-neat">
                  <Shield size={16} />
                  <span>Change Password</span>
                </button>

                <button className="action-btn-neat">
                  <Settings size={16} />
                  <span>Privacy Settings</span>
                </button>

                <button className="action-btn-neat">
                  <Mail size={16} />
                  <span>Email Preferences</span>
                </button>

                <button 
                  onClick={logout}
                  className="action-btn-neat danger-neat"
                >
                  <X size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;