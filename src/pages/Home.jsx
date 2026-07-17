import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const phrases = [
    'AI-Powered Community Healthcare',
    'Multi-Agent Health Intelligence',
    '12 Indian Languages Supported',
    'Emergency Detection in Seconds',
  ];

  /* --------- Typing animation --------- */
  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    let timeout;

    if (!isDeleting && charIndex <= currentPhrase.length) {
      timeout = setTimeout(() => {
        setTypedText(currentPhrase.slice(0, charIndex));
        setCharIndex((prev) => prev + 1);
      }, 60);
    } else if (!isDeleting && charIndex > currentPhrase.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setCharIndex((prev) => prev - 1);
        setTypedText(currentPhrase.slice(0, charIndex - 1));
      }, 35);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex]);

  /* --------- 3D tilt handler --------- */
  const handleMouseMove = (e, cardRef) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
  };

  const handleMouseLeave = (cardRef) => {
    if (cardRef.current)
      cardRef.current.style.transform =
        'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
  };

  /* --------- Stat card refs --------- */
  const statRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const stats = [
    { value: '8', label: 'AI Agents', icon: '🤖' },
    { value: '12', label: 'Languages', icon: '🌍' },
    { value: '500+', label: 'Symptoms', icon: '🩻' },
    { value: '100+', label: 'Schemes', icon: '📜' },
  ];

  /* --------- Feature card refs --------- */
  const featureRefs = Array.from({ length: 8 }, () => useRef(null));

  const features = [
    {
      icon: '🩺',
      title: 'Health Assessment',
      desc: 'Intelligent symptom analysis with severity scoring and urgency classification.',
    },
    {
      icon: '🚨',
      title: 'Emergency Detection',
      desc: 'Real-time detection of life-threatening conditions with instant action protocols.',
    },
    {
      icon: '🏥',
      title: 'Hospital Finder',
      desc: 'Locate nearest government hospitals and clinics matched to your condition.',
    },
    {
      icon: '📋',
      title: 'Govt Schemes',
      desc: 'Eligibility matching for Ayushman Bharat, PMJAY and state health programs.',
    },
    {
      icon: '💊',
      title: 'Medicine Info',
      desc: 'Comprehensive drug information with dosage guides and generic alternatives.',
    },
    {
      icon: '📅',
      title: 'Follow-up Care',
      desc: 'Automated health monitoring schedules and medication reminders.',
    },
    {
      icon: '🌐',
      title: 'Multi-language',
      desc: 'Full consultation support across 12 Indian regional languages.',
    },
    {
      icon: '📊',
      title: 'Analytics',
      desc: 'Community health trends and anonymized outbreak pattern mapping.',
    },
  ];

  /* --------- Orbiting icons --------- */
  const orbitIcons = [
    { emoji: '🩺', delay: 0 },
    { emoji: '🏥', delay: 1 },
    { emoji: '💊', delay: 2 },
    { emoji: '❤️', delay: 3 },
    { emoji: '🧬', delay: 4 },
    { emoji: '💉', delay: 5 },
  ];

  /* --------- Particles --------- */
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: 4 + Math.random() * 4,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 10,
  }));

  /* --------- Steps data --------- */
  const steps = [
    {
      num: '01',
      title: 'Describe Symptoms',
      desc: 'Tell us how you feel in your own language.',
      icon: '🗣️',
    },
    {
      num: '02',
      title: 'AI Analysis',
      desc: 'Eight specialized agents collaborate instantly.',
      icon: '⚡',
    },
    {
      num: '03',
      title: 'Action Plan',
      desc: 'Receive a structured, personalized health roadmap.',
      icon: '🗺️',
    },
  ];

  return (
    <div className="home-container">
      {/* ========== PARTICLES ========== */}
      <div className="particles-container" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className="particle"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* ========== HERO ========== */}
      <section className="hero-section">
        <div className="hero-perspective">
          {/* Central hologram */}
          <div className="hologram-stage">
            <div className="hologram-ring hologram-ring--outer" />
            <div className="hologram-ring hologram-ring--inner" />
            <div className="hologram-core">
              {/* CSS cross / shield icon */}
              <div className="hologram-icon">
                <span className="cross-v" />
                <span className="cross-h" />
              </div>
            </div>
            <div className="hologram-glow" />

            {/* Orbiting medical icons */}
            {orbitIcons.map((item, idx) => (
              <span
                key={idx}
                className={`orbit-icon orbit-icon--${idx}`}
                style={{ animationDelay: `${-idx * (20 / 6)}s` }}
              >
                {item.emoji}
              </span>
            ))}
          </div>

          {/* Text overlay */}
          <div className="hero-text">
            <h1 className="hero-title-3d">
              LifeLine <span className="gradient-text">AI</span>
            </h1>
            <p className="hero-typed">
              {typedText}
              <span className="typing-cursor">|</span>
            </p>
            <div className="hero-ctas">
              <button
                className="btn-3d btn-3d--primary"
                onClick={() => navigate('/chat')}
              >
                Start Health Check →
              </button>
              <button
                className="btn-3d btn-3d--secondary"
                onClick={() => navigate('/dashboard')}
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="stats-section">
        {stats.map((s, idx) => (
          <div
            key={idx}
            ref={statRefs[idx]}
            className="stat-card-3d"
            onMouseMove={(e) => handleMouseMove(e, statRefs[idx])}
            onMouseLeave={() => handleMouseLeave(statRefs[idx])}
          >
            <span className="stat-icon">{s.icon}</span>
            <h3 className="stat-value">{s.value}</h3>
            <p className="stat-label">{s.label}</p>
            <div className="stat-glow-border" />
          </div>
        ))}
      </section>

      {/* ========== FEATURES ========== */}
      <section className="features-section">
        <h2 className="section-heading">
          Coordinated <span className="gradient-text">AI Specialization</span>
        </h2>
        <p className="section-sub">
          Eight focused agents work together — not a single generic chatbot.
        </p>

        <div className="features-grid">
          {features.map((f, idx) => (
            <div
              key={idx}
              ref={featureRefs[idx]}
              className="feature-card-3d"
              onMouseMove={(e) => handleMouseMove(e, featureRefs[idx])}
              onMouseLeave={() => handleMouseLeave(featureRefs[idx])}
            >
              <div className="feature-card-inner">
                <span className="feature-icon-3d">{f.icon}</span>
                <h4 className="feature-title">{f.title}</h4>
                <p className="feature-desc">{f.desc}</p>
              </div>
              <div className="feature-glow-border" />
            </div>
          ))}
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="how-section">
        <h2 className="section-heading">
          How It <span className="gradient-text">Works</span>
        </h2>

        <div className="steps-row">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="step-node">
                <div className="step-circle">
                  <span className="step-circle-icon">{step.icon}</span>
                  <div className="step-pulse-ring" />
                </div>
                <h4 className="step-title">{step.title}</h4>
                <p className="step-desc">{step.desc}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className="step-connector">
                  <div className="connector-line" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ========== CTA FOOTER ========== */}
      <section className="cta-footer">
        <div className="cta-glow-bg" />
        <h2 className="cta-heading">Your health journey starts here</h2>
        <p className="cta-sub">
          Free, multilingual, AI-powered healthcare guidance — available 24/7.
        </p>
        <button
          className="btn-3d btn-3d--primary btn-3d--lg"
          onClick={() => navigate('/chat')}
        >
          Begin Consultation →
        </button>
      </section>
    </div>
  );
}
