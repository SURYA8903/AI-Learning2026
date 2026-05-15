import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('home');
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsLoggedIn(true);
    setUser(userData);
    setCurrentPage('dashboard');
  };

  // Render different pages based on currentPage
  const renderPage = () => {
    if (!isLoggedIn) {
      switch (currentPage) {
        case 'login':
          return (
            <LoginPage 
              onLogin={handleLogin} 
              onSwitchToSignup={() => setCurrentPage('signup')}
            />
          );
        case 'signup':
          return (
            <SignupPage 
              onSignup={handleLogin}
              onSwitchToLogin={() => setCurrentPage('login')}
            />
          );
        default:
          return <HomePage onNavigate={setCurrentPage} />;
      }
    }

    // Logged in pages
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage user={user} onNavigate={setCurrentPage} />;
      case 'courses':
        return <CoursesPage user={user} onNavigate={setCurrentPage} />;
      case 'certificates':
        return <CertificatesPage user={user} />;
      case 'management':
        return user?.role === 'admin' || user?.role === 'trainer' ? (
          <ManagementPage user={user} />
        ) : (
          <AccessDeniedPage onNavigate={setCurrentPage} />
        );
      default:
        return <DashboardPage user={user} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="app">
      <Navigation 
        isLoggedIn={isLoggedIn} 
        user={user}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />
      
      <main className="app-main">
        {renderPage()}
      </main>

      <Footer />
    </div>
  );
};

// Navigation Component
const Navigation = ({ isLoggedIn, user, onNavigate, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => onNavigate('home')}>
          🎓 E-Learning Platform
        </div>

        <div className="navbar-menu">
          {!isLoggedIn ? (
            <>
              <button 
                className="nav-btn"
                onClick={() => onNavigate('login')}
              >
                Login
              </button>
              <button 
                className="nav-btn nav-btn-primary"
                onClick={() => onNavigate('signup')}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <button 
                className="nav-btn"
                onClick={() => onNavigate('dashboard')}
              >
                Dashboard
              </button>
              <button 
                className="nav-btn"
                onClick={() => onNavigate('courses')}
              >
                Courses
              </button>
              <button 
                className="nav-btn"
                onClick={() => onNavigate('certificates')}
              >
                Certificates
              </button>
              {(user?.role === 'admin' || user?.role === 'trainer') && (
                <button 
                  className="nav-btn"
                  onClick={() => onNavigate('management')}
                >
                  Management
                </button>
              )}
              <div className="user-menu">
                <span className="user-name">{user?.firstName}</span>
                <button 
                  className="nav-btn nav-btn-logout"
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// Home Page
const HomePage = ({ onNavigate }) => {
  return (
    <div className="page home-page">
      <section className="hero">
        <h1>Learn. Earn. Grow.</h1>
        <p>Access premium courses with automatic certificate generation</p>
        <button 
          className="btn btn-primary"
          onClick={() => onNavigate('signup')}
        >
          Get Started Free
        </button>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">📚</div>
          <h3>Expert Courses</h3>
          <p>Learn from industry experts with real-world projects</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎓</div>
          <h3>Certificates</h3>
          <p>Get auto-generated certificates upon completion</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💳</div>
          <h3>Secure Payments</h3>
          <p>Safe and secure payment with multiple options</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🏆</div>
          <h3>Career Growth</h3>
          <p>Boost your career with verified credentials</p>
        </div>
      </section>
    </div>
  );
};

// Login Page
const LoginPage = ({ onLogin, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // This would call your actual login API
      // For demo: localStorage.setItem('token', 'demo_token');
      alert('Login functionality to be implemented with backend API');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page login-page">
      <div className="auth-container">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>Don't have an account? <button onClick={onSwitchToSignup}>Sign Up</button></p>
      </div>
    </div>
  );
};

// Signup Page
const SignupPage = ({ onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      alert('Signup functionality to be implemented with backend API');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page signup-page">
      <div className="auth-container">
        <h2>Create Account</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p>Already have an account? <button onClick={onSwitchToLogin}>Login</button></p>
      </div>
    </div>
  );
};

// Dashboard Page
const DashboardPage = ({ user, onNavigate }) => {
  return (
    <div className="page dashboard-page">
      <h1>Welcome, {user?.firstName}! 👋</h1>
      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>📚 Courses</h3>
          <p>5 courses enrolled</p>
          <button 
            className="btn btn-secondary"
            onClick={() => onNavigate('courses')}
          >
            View Courses
          </button>
        </div>

        <div className="dashboard-card">
          <h3>🎓 Certificates</h3>
          <p>2 certificates earned</p>
          <button 
            className="btn btn-secondary"
            onClick={() => onNavigate('certificates')}
          >
            View Certificates
          </button>
        </div>

        <div className="dashboard-card">
          <h3>⏱️ Progress</h3>
          <p>45% average completion</p>
          <button className="btn btn-secondary">Continue Learning</button>
        </div>

        <div className="dashboard-card">
          <h3>🏆 Achievements</h3>
          <p>5 achievements unlocked</p>
          <button className="btn btn-secondary">View All</button>
        </div>
      </div>
    </div>
  );
};

// Courses Page
const CoursesPage = ({ user, onNavigate }) => {
  const [courses] = React.useState([
    { id: 1, title: 'Python Programming', price: 299, enrolled: true },
    { id: 2, title: 'Web Development', price: 399, enrolled: false },
    { id: 3, title: 'Data Science', price: 499, enrolled: true },
  ]);

  return (
    <div className="page courses-page">
      <h1>Courses</h1>
      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <h3>{course.title}</h3>
            <p>₹{course.price}</p>
            <button className="btn btn-primary">
              {course.enrolled ? 'Enrolled' : 'Enroll Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

import MyCertificates from './components/MyCertificates';

// Certificates Page
const CertificatesPage = ({ user }) => {
  return (
    <div className="page certificates-page">
      <MyCertificates user={user} />
    </div>
  );
};

import StudentManagement from './components/StudentManagement';

// Management Page (Admin/Trainer)
const ManagementPage = ({ user }) => {
  return (
    <div className="page admin-page">
      <StudentManagement user={user} />
    </div>
  );
};

// Access Denied
const AccessDeniedPage = ({ onNavigate }) => {
  return (
    <div className="page access-denied">
      <h1>❌ Access Denied</h1>
      <p>You don't have permission to access this page</p>
      <button 
        className="btn btn-primary"
        onClick={() => onNavigate('dashboard')}
      >
        Go Back to Dashboard
      </button>
    </div>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2024 E-Learning Platform. All rights reserved.</p>
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default App;
