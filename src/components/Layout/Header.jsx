import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Header.css';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'mr', label: 'मराठी' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'or', label: 'ଓଡ଼ିଆ' },
  { code: 'ur', label: 'اردو' },
];

export default function Header() {
  const { currentLanguage, setLanguage, isProcessing, logout } = useApp();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const langRef = useRef(null);
  const location = useLocation();

  useEffect(() => { setMobileMenuOpen(false); }, [location]);

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLangLabel = LANGUAGES.find(l => l.code === currentLanguage)?.label || 'English';

  return (
    <header className="header">
      <div className="header__inner">
        {/* Logo */}
        <NavLink to="/" className="header__logo">
          <span className="header__logo-icon">💚</span>
          <div className="header__logo-text">
            <span className="header__logo-title text-gradient">LifeLine AI</span>
            <span className="header__logo-subtitle">Multi-Agent Healthcare Assistant</span>
          </div>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="header__nav hide-mobile">
          <NavLink to="/" end className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
            <span className="header__nav-icon">🏠</span> Home
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
            <span className="header__nav-icon">💬</span> Chat
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
            <span className="header__nav-icon">📊</span> Dashboard
          </NavLink>
          <NavLink to="/schemes" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
            <span className="header__nav-icon">📋</span> Schemes
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
            <span className="header__nav-icon">📋</span> History
          </NavLink>
        </nav>

        {/* Right side */}
        <div className="header__actions">
          {/* AI Active Indicator */}
          <div className="header__status">
            <span className={`header__status-dot ${isProcessing ? 'header__status-dot--active' : ''}`} />
            <span className="header__status-text hide-mobile">{isProcessing ? 'Processing' : 'AI Active'}</span>
          </div>

          {/* Language Selector */}
          <div className="header__lang" ref={langRef}>
            <button className="header__lang-btn btn btn-ghost btn-sm" onClick={() => setLangOpen(!langOpen)}>
              🌐 <span className="hide-mobile">{currentLangLabel}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="M1 3.5L5 7.5L9 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </button>
            {langOpen && (
              <div className="header__lang-dropdown animate-slideDown">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    className={`header__lang-option ${currentLanguage === lang.code ? 'header__lang-option--active' : ''}`}
                    onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                  >
                    {lang.label}
                    {currentLanguage === lang.code && <span className="header__lang-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button className="btn btn-ghost btn-sm" onClick={logout} title="Logout" style={{ marginLeft: '0.5rem' }}>
            🚪 <span className="hide-mobile">Logout</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button className="header__hamburger hide-tablet" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span className={`header__hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
            <span className={`header__hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
            <span className={`header__hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="header__mobile-nav animate-slideDown">
          <NavLink to="/" end className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>🏠 Home</NavLink>
          <NavLink to="/chat" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>💬 Chat</NavLink>
          <NavLink to="/dashboard" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>📊 Dashboard</NavLink>
          <NavLink to="/schemes" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>📋 Schemes</NavLink>
          <NavLink to="/history" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>📋 History</NavLink>
          <button className="header__mobile-link" onClick={() => { logout(); setMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left', width: '100%', padding: 'inherit', font: 'inherit' }}>🚪 Logout</button>
        </nav>
      )}
    </header>
  );
}
