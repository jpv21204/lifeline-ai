import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    { title: 'Symptom Assessment', icon: '🩺', desc: 'Analyzes symptoms, estimates urgency and links to specialized care.' },
    { title: 'Emergency Alerts', icon: '📞', desc: 'Detects life-threatening symptoms and triggers immediate guidance.' },
    { title: 'Hospital Finder', icon: '🏥', desc: 'Finds nearest matching healthcare clinics & government hospitals.' },
    { title: 'Gov Schemes Eligibility', icon: '📋', desc: 'Matches profile with Indian government health coverage plans.' },
    { title: 'Medicine Reference', icon: '💊', desc: 'Provides dosage, usage warnings and links to generic drugs.' },
    { title: 'Follow-up Timelines', icon: '📅', desc: 'Schedules health monitoring plans and medicine reminders.' },
    { title: '12 Indian Languages', icon: '🌐', desc: 'Full translation translation for regional language consultation.' },
    { title: 'Community Insights', icon: '📊', desc: 'Anonymized stats mapping local outbreak trends for prevention.' }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">🛡️ Hackathon Project - Multi-Agent AI</div>
          <h1 className="hero-title">
            Empowering Communities with <span className="gradient-text">LifeLine AI</span>
          </h1>
          <p className="hero-subtitle">
            An intelligent Multi-Agent Healthcare Assistant coordinating specialized AI agents to help you make correct medical decisions before, during, and after hospital visits.
          </p>
          <div className="hero-ctas">
            <button className="btn btn-primary" onClick={() => navigate('/chat')}>
              🚀 Start Consultation
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              📊 System Dashboard
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="agent-circle-container">
            <div className="center-brain">🧠</div>
            <div className="orbiting-agent oa-1">🩺</div>
            <div className="orbiting-agent oa-2">🏥</div>
            <div className="orbiting-agent oa-3">📋</div>
            <div className="orbiting-agent oa-4">💊</div>
            <div className="orbiting-agent oa-5">📞</div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="stats-section">
        <div className="stat-item glass-card">
          <h3>8</h3>
          <p>Collaborating AI Agents</p>
        </div>
        <div className="stat-item glass-card">
          <h3>12</h3>
          <p>Indian Languages</p>
        </div>
        <div className="stat-item glass-card">
          <h3>24/7</h3>
          <p>Instant Guidance</p>
        </div>
        <div className="stat-item glass-card">
          <h3>100%</h3>
          <p>Free & Open Access</p>
        </div>
      </section>

      {/* Agents / Features Grid */}
      <section className="features-section">
        <h2 className="section-title">Coordinated AI Specialization</h2>
        <p className="section-subtitle">
          Instead of a generic chatbot, LifeLine AI splits tasks between eight focused agent systems.
        </p>

        <div className="features-grid">
          {features.map((f, idx) => (
            <div key={idx} className="feature-card glass-card">
              <span className="feature-icon">{f.icon}</span>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step-card glass-card">
            <div className="step-num">1</div>
            <h4>Input Symptoms</h4>
            <p>Type symptoms or health questions in your regional language.</p>
          </div>
          <div className="step-card glass-card">
            <div className="step-num">2</div>
            <h4>Agent Orchestration</h4>
            <p>Orchestrator spawns assessment, emergency, hospital, scheme, and medicine agents.</p>
          </div>
          <div className="step-card glass-card">
            <div className="step-num">3</div>
            <h4>Personalized Plan</h4>
            <p>Receive a structured health action plan with reminders and local resources.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
