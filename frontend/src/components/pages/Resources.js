import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { resourcesAPI, bookmarksAPI, feedbackAPI } from '../../services/api';
import { BookOpen, Download, Bookmark, Star, Filter, Search, Calendar, User } from 'lucide-react';

const Resources = () => {
  const { isAuthenticated } = useAuth();
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedResources, setBookmarkedResources] = useState(new Set());
  const [filters, setFilters] = useState({
    department: '',
    subject: '',
    category: '',
    search: ''
  });

  const departments = [
    'Computer Science', 'Information Technology', 'Electronics',
    'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Business Administration', 'Commerce', 'Other'
  ];

  const categories = [
    'notes', 'assignment', 'webinar', 'workshop', 'placement', 'internship', 'other'
  ];

  useEffect(() => {
    fetchResources();
    if (isAuthenticated) {
      fetchBookmarks();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterResources();
  }, [resources, filters]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await resourcesAPI.getAll();
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const response = await bookmarksAPI.getAll();
      const bookmarkedIds = new Set(response.data.map(bookmark => bookmark.resource_id));
      setBookmarkedResources(bookmarkedIds);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (filters.department) {
      filtered = filtered.filter(resource => 
        resource.department.toLowerCase() === filters.department.toLowerCase()
      );
    }

    if (filters.subject) {
      filtered = filtered.filter(resource => 
        resource.subject.toLowerCase().includes(filters.subject.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(resource => 
        resource.category === filters.category
      );
    }  

    if (filters.search) {
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        resource.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredResources(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      subject: '',
      category: '',
      search: ''
    });
  };

  const handleDownload = async (resourceId, fileName) => {
    try {
      const response = await resourcesAPI.download(resourceId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleBookmark = async (resourceId) => {
    if (!isAuthenticated) {
      alert('Please login to bookmark resources');
      return;
    }

    try {
      if (bookmarkedResources.has(resourceId)) {
        await bookmarksAPI.remove(resourceId);
        setBookmarkedResources(prev => {
          const newSet = new Set(prev);
          newSet.delete(resourceId);
          return newSet;
        });
      } else {
        await bookmarksAPI.add(resourceId);
        setBookmarkedResources(prev => new Set([...prev, resourceId]));
      }
    } catch (error) {
      console.error('Error managing bookmark:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        <p>Loading resources...</p>
      </div>
    );
  }

  return (
    <div className="resources-page">
      <div className="page-header">
        <h1>Academic Resources</h1>
        <p>Discover and download study materials, notes, and educational content</p>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <div className="filter-header">
          <h3><Filter size={20} /> Filter Resources</h3>
          <button onClick={clearFilters} className="btn btn-secondary">
            Clear Filters
          </button>
        </div>
        
        <div className="filter-row">
          <div className="filter-group">
            <label className="form-label">Search</label>
            <div className="input-group">
              <Search className="input-icon" size={20} />
              <input
                type="text"
                className="form-input"
                placeholder="Search resources..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          
          <div className="filter-group">
            <label className="form-label">Department</label>
            <select
              className="form-select"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter subject..."
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="resources-results">
        <div className="results-header">
          <h3>
            {filteredResources.length} Resource{filteredResources.length !== 1 ? 's' : ''} Found
          </h3>
        </div>

        {filteredResources.length === 0 ? (
          <div className="no-results">
            <BookOpen size={64} />
            <h3>No resources found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="resource-grid">
            {filteredResources.map(resource => (
              <div key={resource.id} className="resource-card">
                <div className="resource-header">
                  <h3 className="resource-title">{resource.title}</h3>
                  <div className="resource-category">
                    {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
                  </div>
                </div>
                
                <div className="resource-meta">
                  <div className="meta-item">
                    <User size={16} />
                    <span>{resource.uploader_name}</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>{formatDate(resource.created_at)}</span>
                  </div>
                </div>
                
                <p className="resource-description">{resource.description}</p>
                
                <div className="resource-details">
                  <div className="detail-item">
                    <strong>Department:</strong> {resource.department}
                  </div>
                  <div className="detail-item">
                    <strong>Subject:</strong> {resource.subject}
                  </div>
                  <div className="detail-item">
                    <strong>File Size:</strong> {formatFileSize(resource.file_size)}
                  </div>
                  <div className="detail-item">
                    <strong>Downloads:</strong> {resource.download_count}
                  </div>
                </div>
                
                <div className="resource-actions">
                  <button
                    onClick={() => handleDownload(resource.id, resource.file_name)}
                    className="btn btn-primary"
                  >
                    <Download size={16} />
                    Download
                  </button>
                  
                  {isAuthenticated && (
                    <button
                      onClick={() => handleBookmark(resource.id)}
                      className={`btn ${bookmarkedResources.has(resource.id) ? 'btn-success' : 'btn-secondary'}`}
                    >
                      <Bookmark size={16} />
                      {bookmarkedResources.has(resource.id) ? 'Bookmarked' : 'Bookmark'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;