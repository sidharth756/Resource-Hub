import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Upload, Users, Calendar, Star, TrendingUp, Shield, Mail, ArrowRight } from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubscribed(true);
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
    }
    
    setLoading(false);
  };

  const features = [
    {
      icon: <BookOpen size={32} />,
      title: "Rich Resource Library",
      description: "Access comprehensive study materials, lecture notes, and academic resources organized by department and subject."
    },
    {
      icon: <Upload size={32} />,
      title: "Seamless Sharing",
      description: "Upload and share educational materials with our intuitive platform designed for academic collaboration."
    },
    {
      icon: <Users size={32} />,
      title: "Academic Community",
      description: "Connect with students, faculty, and researchers in a collaborative learning environment."
    },
    {
      icon: <Shield size={32} />,
      title: "Quality Assured",
      description: "All materials undergo quality review to ensure academic excellence and relevance."
    }
  ];

  return (
    <div className="home-page-neat">
      {/* Hero Section */}
      <section className="hero-section-neat">
        <div className="hero-container">
          <div className="hero-content-neat">
            <h1 className="hero-title">Academic Resource Hub</h1>
            <p className="hero-subtitle">
              Empowering education through collaborative resource sharing. 
              Access, upload, and discover high-quality academic materials in one centralized platform.
            </p>
            
            <div className="hero-actions-neat">
              {isAuthenticated ? (
                <>
                  <Link to="/resources" className="btn-hero primary">
                    <BookOpen size={18} />
                    Browse Resources
                    <ArrowRight size={16} />
                  </Link>
                  <Link to="/upload" className="btn-hero secondary">
                    <Upload size={18} />
                    Share Material
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn-hero primary">
                    Get Started
                    <ArrowRight size={16} />
                  </Link>
                  <Link to="/resources" className="btn-hero secondary">
                    Explore Resources
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section-neat">
        <div className="features-container">
          <div className="section-header-neat">
            <h2>Why Choose Our Platform?</h2>
            <p>Discover the features that enhance your academic journey</p>
          </div>
          
          <div className="features-grid-neat">
            {features.map((feature, index) => (
              <div key={index} className="feature-card-neat">
                <div className="feature-icon-neat">{feature.icon}</div>
                <h3 className="feature-title-neat">{feature.title}</h3>
                <p className="feature-description-neat">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions for Authenticated Users */}
      {isAuthenticated && (
        <section className="dashboard-preview-section">
          <div className="dashboard-container">
            <div className="section-header-neat">
              <h2>Welcome back, {user?.name}!</h2>
              <p>Quick access to your most used features</p>
            </div>
            
            <div className="dashboard-actions-grid">
              <Link to="/resources" className="dashboard-card">
                <BookOpen size={24} />
                <div className="dashboard-card-content">
                  <h3>Browse Resources</h3>
                  <p>Discover new study materials</p>
                </div>
              </Link>
              
              <Link to="/upload" className="dashboard-card">
                <Upload size={24} />
                <div className="dashboard-card-content">
                  <h3>Upload Material</h3>
                  <p>Share your knowledge</p>
                </div>
              </Link>
              
              <Link to="/bookmarks" className="dashboard-card">
                <Star size={24} />
                <div className="dashboard-card-content">
                  <h3>My Bookmarks</h3>
                  <p>Access saved resources</p>
                </div>
              </Link>
              
              <Link to="/calendar" className="dashboard-card">
                <Calendar size={24} />
                <div className="dashboard-card-content">
                  <h3>Academic Calendar</h3>
                  <p>View upcoming events</p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="newsletter-section-neat">
        <div className="newsletter-container">
          <div className="newsletter-content-neat">
            <h2 className="newsletter-title">Stay Connected</h2>
            <p className="newsletter-subtitle">
              Get notified about new resources, updates, and academic announcements
            </p>
            
            {subscribed ? (
              <div className="newsletter-success-neat">
                <div className="success-icon">
                  <Star size={24} />
                </div>
                <h3>Successfully Subscribed!</h3>
                <p>Thank you for joining our community. You'll receive updates about new resources and announcements.</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="newsletter-form-neat">
                <div className="newsletter-input-neat">
                  <Mail size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                  <button type="submit" disabled={loading} className="newsletter-btn">
                    {loading ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="cta-section-neat">
          <div className="cta-container">
            <div className="cta-content-neat">
              <h2 className="cta-title">Ready to Begin?</h2>
              <p className="cta-subtitle">
                Join our academic community and take advantage of collaborative learning resources
              </p>
              
              <div className="cta-actions-neat">
                <Link to="/register" className="btn-cta primary">
                  Create Account
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-cta secondary">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;