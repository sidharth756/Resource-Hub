import React, { useState, useEffect } from 'react';
import { bookmarksAPI, resourcesAPI } from '../../services/api';
import { Bookmark, Download, Calendar, User, X } from 'lucide-react';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await bookmarksAPI.getAll();
      setBookmarks(response.data);
    } catch (error) {
      setError('Failed to fetch bookmarks');
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (resourceId) => {
    try {
      await bookmarksAPI.remove(resourceId);
      setBookmarks(prev => prev.filter(bookmark => bookmark.resource_id !== resourceId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
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
        <p>Loading bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="bookmarks-page">
      <div className="page-header">
        <h1>My Bookmarks</h1>
        <p>Your saved resources for quick access</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {bookmarks.length === 0 ? (
        <div className="no-bookmarks">
          <Bookmark size={64} />
          <h3>No bookmarks yet</h3>
          <p>Start bookmarking resources to see them here</p>
        </div>
      ) : (
        <div className="bookmarks-grid">
          {bookmarks.map(bookmark => (
            <div key={bookmark.resource_id} className="bookmark-card">
              <div className="bookmark-header">
                <h3 className="bookmark-title">{bookmark.title}</h3>
                <button
                  onClick={() => handleRemoveBookmark(bookmark.resource_id)}
                  className="remove-bookmark-btn"
                  title="Remove bookmark"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="bookmark-category">
                {bookmark.category.charAt(0).toUpperCase() + bookmark.category.slice(1)}
              </div>
              
              <div className="bookmark-meta">
                <div className="meta-item">
                  <User size={16} />
                  <span>{bookmark.uploader_name}</span>
                </div>
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>{formatDate(bookmark.resource_created_at)}</span>
                </div>
              </div>
              
              <p className="bookmark-description">{bookmark.description}</p>
              
              <div className="bookmark-details">
                <div className="detail-item">
                  <strong>Department:</strong> {bookmark.department}
                </div>
                <div className="detail-item">
                  <strong>Subject:</strong> {bookmark.subject}
                </div>
              </div>
              
              <div className="bookmark-actions">
                <button
                  onClick={() => handleDownload(bookmark.resource_id, bookmark.file_name)}
                  className="btn btn-primary"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;