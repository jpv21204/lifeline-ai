import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setForm({ fullName: '', email: '', phone: '', password: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'signup') {
      // Validate required fields
      if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
        setError('Please fill in all required fields.');
        return;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      // Save user data to localStorage
      const userData = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        createdAt: new Date().toISOString(),
      };

      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('lifeline_user') || '[]');
      const userExists = Array.isArray(existingUsers)
        ? existingUsers.some((u) => u.email === userData.email)
        : existingUsers.email === userData.email;

      if (userExists) {
        setError('An account with this email already exists. Please log in.');
        return;
      }

      // Store as array of users
      const users = Array.isArray(existingUsers) ? existingUsers : existingUsers.email ? [existingUsers] : [];
      users.push(userData);
      localStorage.setItem('lifeline_user', JSON.stringify(users));

      // Auto-login after signup
      localStorage.setItem(
        'lifeline_auth',
        JSON.stringify({
          isLoggedIn: true,
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          createdAt: userData.createdAt,
        })
      );

      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => navigate('/'), 1000);
    } else {
      // Login mode
      if (!form.email.trim() || !form.password.trim()) {
        setError('Please enter your email and password.');
        return;
      }

      const storedUsers = JSON.parse(localStorage.getItem('lifeline_user') || '[]');
      const users = Array.isArray(storedUsers) ? storedUsers : storedUsers.email ? [storedUsers] : [];
      const matchedUser = users.find(
        (u) => u.email === form.email.trim().toLowerCase() && u.password === form.password
      );

      if (!matchedUser) {
        setError('Invalid email or password. Please try again.');
        return;
      }

      localStorage.setItem(
        'lifeline_auth',
        JSON.stringify({
          isLoggedIn: true,
          fullName: matchedUser.fullName,
          email: matchedUser.email,
          phone: matchedUser.phone,
          createdAt: matchedUser.createdAt,
        })
      );

      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 1000);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Hero Panel */}
      <div className="auth-hero">
        <div className="auth-hero-logo">🛡️</div>
        <h1 className="auth-hero-title">LifeLine AI</h1>
        <p className="auth-hero-tagline">
          Your intelligent multi-agent healthcare assistant — empowering communities with AI-driven medical guidance in 12 Indian languages.
        </p>
        <div className="auth-hero-features">
          <div className="auth-hero-feature">
            <span className="auth-hero-feature-icon">🩺</span>
            <span>AI-powered symptom assessment &amp; triage</span>
          </div>
          <div className="auth-hero-feature">
            <span className="auth-hero-feature-icon">🏥</span>
            <span>Nearest hospital &amp; clinic finder</span>
          </div>
          <div className="auth-hero-feature">
            <span className="auth-hero-feature-icon">📋</span>
            <span>Government health scheme eligibility</span>
          </div>
          <div className="auth-hero-feature">
            <span className="auth-hero-feature-icon">💊</span>
            <span>Medicine reference &amp; dosage info</span>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-glass-card">
            <div className="auth-form-header">
              <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
              <p>{mode === 'login' ? 'Sign in to continue your health journey' : 'Join LifeLine AI for personalized care'}</p>
            </div>

            {/* Toggle */}
            <div className="auth-toggle">
              <button
                type="button"
                className={`auth-toggle-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => switchMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={`auth-toggle-btn ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => switchMode('signup')}
              >
                Sign Up
              </button>
            </div>

            {/* Messages */}
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            {/* Form */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div className="auth-field">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              {mode === 'signup' && (
                <div className="auth-field">
                  <label htmlFor="phone">Phone Number <span style={{ opacity: 0.5 }}>(optional)</span></label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div className="auth-password-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter your password'}
                    value={form.password}
                    onChange={handleChange}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit">
                {mode === 'login' ? '🔓 Sign In' : '🚀 Create Account'}
              </button>
            </form>

            {/* Footer toggle */}
            <div className="auth-footer">
              {mode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => switchMode('signup')}>
                    Sign up
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button type="button" onClick={() => switchMode('login')}>
                    Sign in
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
