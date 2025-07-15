import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { resourcesAPI } from '../../services/api';
import { CloudUpload, File, X, CheckCircle, AlertCircle, FileUp } from 'lucide-react';
import './Upload.css';

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    department: user?.department || '',
    category: 'notes'
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const departments = [
    'Computer Science', 'Information Technology', 'Electronics',
    'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Business Administration', 'Commerce', 'Other'
  ];

  const categories = [
    { value: 'notes', label: '📝 Study Notes' },
    { value: 'assignment', label: '📋 Assignment' },
    { value: 'webinar', label: '🎥 Webinar Material' },
    { value: 'workshop', label: '🛠️ Workshop Material' },
    { value: 'placement', label: '💼 Placement Material' },
    { value: 'internship', label: '🎯 Internship Material' },
    { value: 'other', label: '📁 Other' }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size should not exceed 10MB');
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('File type not supported. Please upload PDF, DOC, DOCX, PPT, PPTX, TXT, or image files.');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('subject', formData.subject);
      uploadData.append('department', formData.department);
      uploadData.append('category', formData.category);

      await resourcesAPI.upload(uploadData);
      
      setSuccess('Resource uploaded successfully! It\'s now available for download.');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        department: user?.department || '',
        category: 'notes'
      });
      setFile(null);
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="upload-page">
        <div className="success-container">
          <div className="success-card">
            <CheckCircle size={64} className="success-icon" />
            <h2>Upload Successful!</h2>
            <p>Your resource has been uploaded and is now available for download.</p>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="btn btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="full-width-container">
      <div className="content-container">
        <div className="upload-header-neat">
          <div className="upload-title-section">
            <h1 className="upload-title">📤 Upload Resource</h1>
            <p className="upload-subtitle">Share educational materials with your community</p>
          </div>
        </div>

        <div className="upload-card">
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="upload-form">
            {/* File Upload Area */}
            <div className="file-upload-section">
              <div 
                className={`file-drop-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!file ? (
                  <div className="file-upload-placeholder">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e.target.files[0])}
                      className="file-input"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="file-input-label">
                      <CloudUpload size={48} className="upload-icon" />
                      <h3>Drop your file here or click to browse</h3>
                      <p>Supports PDF, DOC, DOCX, PPT, PPTX, TXT, Images</p>
                      <span className="file-size-limit">Maximum file size: 10MB</span>
                    </label>
                  </div>
                ) : (
                  <div className="file-preview">
                    <div className="file-info">
                      <File size={32} className="file-icon" />
                      <div className="file-details">
                        <h4>{file.name}</h4>
                        <p>{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="remove-file-btn"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="form-fields">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Describe what this resource contains..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., Data Structures, Calculus"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="upload-actions">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !file || !formData.title}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FileUp size={20} />
                    Upload Resource
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;