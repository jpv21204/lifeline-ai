import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { currentLanguage, t } = useApp();
  const [contactForm, setContactForm] = useState({ name: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const toastSuccessMap = {
    en: "Thank you! Your message has been sent successfully.",
    te: "ధన్యవాదాలు! మీ సందేశం విజయవంతంగా పంపబడింది.",
    hi: "धन्यवाद! आपका संदेश सफलतापूर्वक भेज दिया गया है।",
    ta: "நன்றி! உங்கள் செய்தி வெற்றிகரமாக அனுப்பப்பட்டது.",
    kn: "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ.",
    ml: "നന്ദി! നിങ്ങളുടെ സന്ദേശം വിജയകരമായി അയച്ചു.",
    bn: "ধন্যবাদ! আপনার বার্তা সফলভাবে পাঠানো হয়েছে।",
    pa: "ਧੰਨਵਾਦ! ਤੁਹਾਡਾ ਸੁਨੇਹਾ ਸਫਲਤਾਪੂਰਵਕ ਭੇਜਿਆ ਗਿਆ ਹੈ।",
    mr: "धन्यवाद! तुमचा संदेश यशस्वीरित्या पाठवला गेला आहे।",
    gu: "આભાર! તમારો સંદેશ સફળતાપૂર્વક મોકલવામાં આવ્યો છે.",
    or: "ଧନ୍ୟବାଦ! ଆପଣଙ୍କର ବାର୍ତ୍ତା ସଫଳତାର ସହିତ ପଠାଯାଇଛି |",
    ur: "شکریہ! آپ کا پیغام کامیابی کے ساتھ بھیج دیا گیا ہے۔"
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email) return;
    setSubmitted(true);
    setShowToast(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '' });
      setSubmitted(false);
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="premium-home">
      {/* Success Toast Alert */}
      {showToast && (
        <div className="premium-toast" id="contact-success-toast">
          <span className="toast-icon">✉️</span>
          <span className="toast-text">{toastSuccessMap[currentLanguage] || toastSuccessMap['en']}</span>
        </div>
      )}

      {/* Background Glowing Blobs */}
      <div className="aurora-container" aria-hidden="true">
        <div className="aurora-blob aurora-blob--blue" />
        <div className="aurora-blob aurora-blob--teal" />
        <div className="aurora-blob aurora-blob--purple" />
      </div>

      {/* Floating Pill Navbar */}
      <header className="pill-navbar-wrapper">
        <div className="pill-navbar glass-card">
          <div className="navbar-logo" onClick={() => navigate('/')}>
            <span className="navbar-logo-icon">🛡️</span>
            <span className="navbar-logo-text">LifeLine AI</span>
          </div>
          <nav className="navbar-links">
            <button className="nav-link-btn" onClick={() => navigate('/chat')}>{t('chat')}</button>
            <button className="nav-link-btn" onClick={() => navigate('/dashboard')}>{t('dashboard')}</button>
            <button className="nav-link-btn" onClick={() => navigate('/schemes')}>{t('schemes')}</button>
            <button className="nav-link-btn" onClick={() => navigate('/history')}>{t('history')}</button>
          </nav>
          <div className="navbar-actions">
            <button className="nav-btn-primary" onClick={() => navigate('/chat')}>{t('tryItNow')}</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="hero-container-premium">
        <div className="hero-text-content">
          <h1 className="hero-title-premium">
            {t('heroTitle').split('–')[0]} – <span className="text-highlight">{t('heroTitle').split('–')[1] || ''}</span>
          </h1>
          <p className="hero-subtitle-premium">
            {t('tagline')}
          </p>
        </div>

        {/* 3D Particle Wavy Sound Orb */}
        <div className="particle-orb-stage">
          <div className="orb-outer-glow" />
          
          <div className="orb-particle-sphere">
            {/* Concentric rotating dotted waves to simulate a 3D particle sphere */}
            <div className="particle-wave wave--1" />
            <div className="particle-wave wave--2" />
            <div className="particle-wave wave--3" />
            <div className="particle-wave wave--4" />
            <div className="particle-wave wave--5" />
            <div className="particle-wave wave--6" />
            
            {/* Center Core Button */}
            <div className="orb-center-core">
              <span className="orb-mic-icon">🎙️</span>
            </div>
          </div>
        </div>

        {/* Action Button below Orb */}
        <div className="hero-action-wrapper">
          <button className="speak-button-premium" onClick={() => navigate('/chat')}>
            <span className="pulse-dot" />
            {t('startConsultation')}
          </button>
        </div>
      </main>

      {/* Get in Touch Section */}
      <section className="contact-section-premium">
        <div className="contact-divider" />
        <h2 className="contact-title">{t('getInTouch')}</h2>
        <p className="contact-subtitle">
          {t('contactDesc')}
        </p>

        <form className="contact-form-pill glass-card" onSubmit={handleContactSubmit}>
          <input
            id="contact-name"
            type="text"
            placeholder={t('name')}
            value={contactForm.name}
            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
            required
          />
          <input
            id="contact-email"
            type="email"
            placeholder={t('email')}
            value={contactForm.email}
            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
            required
          />
          <button id="contact-submit" type="submit" className="contact-submit-btn">
            {submitted ? 'Sent! ✓' : t('contactUs')}
          </button>
        </form>
      </section>
    </div>
  );
}
