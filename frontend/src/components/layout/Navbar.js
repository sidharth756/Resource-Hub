import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, Home, Upload, Bookmark, Calendar, User, Settings, LogOut, 
  Menu, X, ChevronDown 
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
          <div className="logo-container">
            <img 
              src="/logo/logo.png" 
              alt="Resource Hub" 
              className="logo-image"
              onError={(e) => {
                // Fallback to icon if logo fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="logo-icon-fallback">
              <BookOpen size={24} />
            </div>
          </div>
          <span className="logo-text">Resource Hub</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className={`nav-menu ${isMobileMenuOpen ? 'nav-menu-open' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${isActiveLink('/') ? 'nav-link-active' : ''}`}
            onClick={closeMobileMenu}
          >
            <Home size={18} />
            <span>Home</span>
          </Link>
          
          <Link 
            to="/resources" 
            className={`nav-link ${isActiveLink('/resources') ? 'nav-link-active' : ''}`}
            onClick={closeMobileMenu}
          >
            <BookOpen size={18} />
            <span>Resources</span>
          </Link>
          
          <Link 
            to="/calendar" 
            className={`nav-link ${isActiveLink('/calendar') ? 'nav-link-active' : ''}`}
            onClick={closeMobileMenu}
          >
            <Calendar size={18} />
            <span>Calendar</span>
          </Link>

          {isAuthenticated && (
            <>
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActiveLink('/dashboard') ? 'nav-link-active' : ''}`}
                onClick={closeMobileMenu}
              >
                <User size={18} />
                <span>Dashboard</span>
              </Link>
              
              <Link 
                to="/upload" 
                className={`nav-link ${isActiveLink('/upload') ? 'nav-link-active' : ''}`}
                onClick={closeMobileMenu}
              >
                <Upload size={18} />
                <span>Upload</span>
              </Link>
              
              <Link 
                to="/bookmarks" 
                className={`nav-link ${isActiveLink('/bookmarks') ? 'nav-link-active' : ''}`}
                onClick={closeMobileMenu}
              >
                <Bookmark size={18} />
                <span>Bookmarks</span>
              </Link>
              
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`nav-link ${isActiveLink('/admin') ? 'nav-link-active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <Settings size={18} />
                  <span>Admin</span>
                </Link>
              )}
            </>
          )}
        </div>

        {/* Auth Section */}
        <div className="nav-auth">
          {isAuthenticated ? (
            <div className="user-menu-container">
              <button 
                className="user-menu-trigger" 
                onClick={toggleUserMenu}
              >
                <div className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.name}</span>
                  <span className="user-role">{user?.role}</span>
                </div>
                <ChevronDown size={16} className={`chevron ${isUserMenuOpen ? 'chevron-up' : ''}`} />
              </button>
              
              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User size={16} />
                    My Profile
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="dropdown-item logout-item"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
      )}
    </nav>
  );
};

export default Navbar;