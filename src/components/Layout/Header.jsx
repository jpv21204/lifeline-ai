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
  const { currentLanguage, setLanguage, isProcessing, logout, t } = useApp();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const currentLangLabel = LANGUAGES.find(l => l.code === currentLanguage)?.label || 'English';

  return (
    <header className={`ll-header ${scrolled ? 'll-header--scrolled' : ''}`}>
      <nav className="ll-header__nav">
        {/* Logo */}
        <NavLink to="/" className="ll-header__logo">
          <span className="ll-header__logo-text">
            LifeLine <span className="ll-header__logo-accent">AI</span>
          </span>
        </NavLink>

        {/* Desktop Nav Links */}
        <ul className="ll-header__links">
          <li><NavLink to="/" end className={({isActive}) => `ll-header__link ${isActive ? 'll-header__link--active' : ''}`}>Home</NavLink></li>
          <li><NavLink to="/chat" className={({isActive}) => `ll-header__link ${isActive ? 'll-header__link--active' : ''}`}>Chat</NavLink></li>
          <li><NavLink to="/schemes" className={({isActive}) => `ll-header__link ${isActive ? 'll-header__link--active' : ''}`}>Schemes</NavLink></li>
          <li><NavLink to="/history" className={({isActive}) => `ll-header__link ${isActive ? 'll-header__link--active' : ''}`}>History</NavLink></li>
        </ul>

        {/* Right Actions */}
        <div className="ll-header__actions">
          {/* AI Status */}
          <div className="ll-header__status">
            <span className={`ll-header__status-dot ${isProcessing ? 'll-header__status-dot--active' : ''}`} />
            <span className="ll-header__status-label">{isProcessing ? 'Processing' : 'AI Active'}</span>
          </div>

          {/* Language Selector */}
          <div className="ll-header__lang" ref={langRef}>
            <button className="ll-header__lang-btn" onClick={() => setLangOpen(!langOpen)}>
              🌐 <span className="ll-header__lang-label">{currentLangLabel}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="M1 3.5L5 7.5L9 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </button>
            {langOpen && (
              <div className="ll-header__lang-dropdown">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    className={`ll-header__lang-option ${currentLanguage === lang.code ? 'll-header__lang-option--active' : ''}`}
                    onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                  >
                    {lang.label}
                    {currentLanguage === lang.code && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logout */}
          <button className="ll-header__logout" onClick={logout}>
            Logout
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </button>

          {/* Mobile Menu Toggle */}
          <button className="ll-header__hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            <span className={`ll-header__hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
            <span className={`ll-header__hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
            <span className={`ll-header__hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="ll-header__mobile-menu">
          <NavLink to="/" end className="ll-header__mobile-link" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
          <NavLink to="/chat" className="ll-header__mobile-link" onClick={() => setMobileMenuOpen(false)}>Chat</NavLink>
          <NavLink to="/schemes" className="ll-header__mobile-link" onClick={() => setMobileMenuOpen(false)}>Schemes</NavLink>
          <NavLink to="/history" className="ll-header__mobile-link" onClick={() => setMobileMenuOpen(false)}>History</NavLink>
          <button className="ll-header__mobile-link" onClick={() => { logout(); setMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left', width: '100%', padding: 'inherit', font: 'inherit' }}>Logout</button>
        </div>
      )}
    </header>
  );
}
