import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Home.css';

const TYPING_PHRASES = [
  'Your AI Health Companion',
  'Smart Symptom Analysis',
  'Find Nearby Hospitals',
  'Government Scheme Finder',
  'Medicine Guidelines',
  'Emergency First Aid',
];

export default function Home() {
  const navigate = useNavigate();
  const { t } = useApp();
  const [typedText, setTypedText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowContent(true);
  }, []);

  useEffect(() => {
    const phrase = TYPING_PHRASES[phraseIndex];
    const speed = isDeleting ? 30 : 80;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setTypedText(phrase.slice(0, typedText.length + 1));
        if (typedText.length === phrase.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setTypedText(phrase.slice(0, typedText.length - 1));
        if (typedText.length === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % TYPING_PHRASES.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, phraseIndex]);

  return (
    <div className="ll-home">
      <div className="ll-home__bg" aria-hidden="true">
        <div className="ll-home__bg-orb ll-home__bg-orb--1" />
        <div className="ll-home__bg-orb ll-home__bg-orb--2" />
        <div className="ll-home__bg-orb ll-home__bg-orb--3" />
      </div>

      <div className="ll-home__ecg" aria-hidden="true">
        <svg className="ll-home__ecg-svg ll-home__ecg-svg--top" viewBox="0 0 500 100" preserveAspectRatio="none" fill="none">
          <defs>
            <linearGradient id="ecg-grad-top" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
              <stop offset="30%" stopColor="#22d3ee" stopOpacity="1" />
              <stop offset="70%" stopColor="#2dd4bf" stopOpacity="1" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
            </linearGradient>
            <filter id="ecg-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <path
            d="M0,50 L30,50 L35,50 L40,48 L45,50 L60,50 L65,30 L70,70 L75,10 L80,90 L85,50 L90,50 L95,45 L100,55 L105,50 L140,50 L145,50 L150,48 L155,50 L170,50 L175,30 L180,70 L185,10 L190,90 L195,50 L200,50 L205,45 L210,55 L215,50 L250,50 L255,50 L260,48 L265,50 L280,50 L285,30 L290,70 L295,10 L300,90 L305,50 L310,50 L315,45 L320,55 L325,50 L360,50 L365,50 L370,48 L375,50 L390,50 L395,30 L400,70 L405,10 L410,90 L415,50 L420,50 L425,45 L430,55 L435,50 L500,50"
            stroke="url(#ecg-grad-top)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#ecg-glow)"
            className="ll-home__ecg-path"
          />
        </svg>
        <svg className="ll-home__ecg-svg ll-home__ecg-svg--bottom" viewBox="0 0 500 100" preserveAspectRatio="none" fill="none">
          <defs>
            <linearGradient id="ecg-grad-bot" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="30%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="70%" stopColor="#22d3ee" stopOpacity="1" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,50 L30,50 L35,50 L40,48 L45,50 L60,50 L65,30 L70,70 L75,10 L80,90 L85,50 L90,50 L95,45 L100,55 L105,50 L140,50 L145,50 L150,48 L155,50 L170,50 L175,30 L180,70 L185,10 L190,90 L195,50 L200,50 L205,45 L210,55 L215,50 L250,50 L255,50 L260,48 L265,50 L280,50 L285,30 L290,70 L295,10 L300,90 L305,50 L310,50 L315,45 L320,55 L325,50 L500,50"
            stroke="url(#ecg-grad-bot)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#ecg-glow)"
            className="ll-home__ecg-path ll-home__ecg-path--delayed"
          />
        </svg>
      </div>

      <section className="ll-home__hero">
        <div className={`ll-home__hero-content ${showContent ? 'll-home__hero-content--visible' : ''}`}>
          <div className="ll-home__title-wrap">
            <h1 className="ll-home__title">
              <span className="ll-home__title-text">{typedText}</span>
              <span className="ll-home__cursor">|</span>
            </h1>
          </div>

          <p className="ll-home__subtitle">
            LifeLine AI is your intelligent healthcare companion that helps you before, during, and after your hospital visit.
          </p>

          <div className="ll-home__sphere-container">
            <div className="ll-home__sphere-glow" />
            <div className="ll-home__sphere-ring ll-home__sphere-ring--outer" />
            <div className="ll-home__sphere-ring ll-home__sphere-ring--inner" />
            <div className="ll-home__sphere">
              <div className="ll-home__sphere-highlight" />
              <div className="ll-home__sphere-gradient" />
              <div className="ll-home__sphere-dots" />
            </div>
          </div>

          <div className="ll-home__chat-preview">
            <div className="ll-home__chat-header">
              <div className="ll-home__chat-avatar">
                <span>🤖</span>
                <span className="ll-home__chat-online" />
              </div>
              <div className="ll-home__chat-info">
                <p className="ll-home__chat-name">LifeLine AI Assistant</p>
                <p className="ll-home__chat-status">
                  <span className="ll-home__chat-status-dot" />
                  Online
                </p>
              </div>
              <div className="ll-home__chat-agents">
                <div className="ll-home__chat-agent-dot ll-home__chat-agent-dot--blue">🤖</div>
                <div className="ll-home__chat-agent-dot ll-home__chat-agent-dot--teal">🩺</div>
              </div>
            </div>
            <div className="ll-home__chat-body">
              <div className="ll-home__chat-bubble">
                <p>Hi! I'm your <span style={{fontWeight: 600, color: '#22d3ee'}}>LifeLine AI Assistant</span>. How can I help you with your <span style={{fontWeight: 600, color: '#2dd4bf'}}>health</span> today?</p>
              </div>
            </div>
            <div className="ll-home__chat-input-bar">
              <button className="ll-home__chat-attach">+</button>
              <input type="text" placeholder="Type your message..." className="ll-home__chat-input" readOnly onClick={() => navigate('/chat')} />
              <button className="ll-home__chat-send" onClick={() => navigate('/chat')}>➤</button>
            </div>
          </div>

          <p className="ll-home__voice-hint">
            Prefer talking?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/chat'); }} className="ll-home__voice-link">Try voice mode</a>
          </p>
        </div>
      </section>
    </div>
  );
}
