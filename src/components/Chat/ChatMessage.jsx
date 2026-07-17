import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ActionPlan from '../Dashboard/ActionPlan';
import './ChatMessage.css';

const LANG_LOCALES = {
  en: 'en-US', te: 'te-IN', hi: 'hi-IN', ta: 'ta-IN', kn: 'kn-IN',
  ml: 'ml-IN', bn: 'bn-IN', pa: 'pa-IN', mr: 'mr-IN', gu: 'gu-IN',
  or: 'or-IN', ur: 'ur-PK'
};

const AGENT_META = {
  health_assessment: { emoji: '🩺', label: 'Health' },
  emergency_detection: { emoji: '📞', label: 'Emergency' },
  hospital_finder: { emoji: '🏥', label: 'Hospitals' },
  government_scheme: { emoji: '📋', label: 'Schemes' },
  medicine_info: { emoji: '💊', label: 'Medicine' },
  followup: { emoji: '📅', label: 'Follow-up' },
  translation: { emoji: '🌐', label: 'Translation' },
  analytics: { emoji: '📊', label: 'Analytics' },
};

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const { currentLanguage } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = (text) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (isPlaying) {
        setIsPlaying(false);
        return;
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_LOCALES[currentLanguage] || 'en-US';
    
    // Find matching voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(currentLanguage));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--assistant'} animate-fadeInUp`}>
      {!isUser && (
        <div className="chat-message__avatar">
          <span>🤖</span>
        </div>
      )}

      <div className="chat-message__body">
        <div className={`chat-message__bubble ${isUser ? '' : 'glass-card'}`}>
          {/* Main text with speaker action */}
          <div className="chat-message__text-wrapper">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', width: '100%' }}>
              <div className="chat-message__text" style={{ flex: 1 }}>{parseMarkdownToReact(message.content)}</div>
              {!isUser && (
                <button 
                  type="button"
                  className={`chat-message__speak-btn ${isPlaying ? 'speaking' : ''}`} 
                  onClick={() => speak(message.content)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.15rem', opacity: isPlaying ? 1 : 0.4, transition: 'opacity 0.2s', padding: '0.1rem 0.2rem', userSelect: 'none', marginTop: '0.2rem' }}
                  title={isPlaying ? "Stop speaking" : "Speak response"}
                >
                  {isPlaying ? '⏹️' : '🔊'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Timestamp & response time */}
        <div className="chat-message__meta">
          <span className="chat-message__time">{formatTime(message.timestamp)}</span>
          {!isUser && message.responseTime && (
            <span className="chat-message__response-time">⚡ {(message.responseTime / 1000).toFixed(1)}s</span>
          )}
        </div>
      </div>

      {isUser && (
        <div className="chat-message__avatar chat-message__avatar--user">
          <span>👤</span>
        </div>
      )}
    </div>
  );
}

function parseMarkdownToReact(text) {
  if (!text) return null;

  // Split by lines
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    let cleanLine = line.trim();
    if (!cleanLine) return <div key={idx} style={{ height: '0.5rem' }} />;

    // Headers: ### Topic
    if (cleanLine.startsWith('###')) {
      const headerText = cleanLine.replace(/^###\s*/, '');
      const content = parseInlineBold(headerText);
      return (
        <h4 key={idx} style={{ 
          margin: '0.85rem 0 0.5rem', 
          fontFamily: 'var(--font-heading)', 
          color: 'var(--accent-teal)', 
          fontSize: '1.02rem',
          fontWeight: '800',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          paddingBottom: '0.25rem'
        }}>
          {content}
        </h4>
      );
    }

    // Bullet items: * item
    if (cleanLine.startsWith('*') || cleanLine.startsWith('-')) {
      const bulletText = cleanLine.replace(/^[*+-]\s*/, '');
      const content = parseInlineBold(bulletText);
      return (
        <li key={idx} style={{ 
          marginLeft: '1.25rem', 
          listStyleType: 'disc', 
          marginBottom: '0.35rem', 
          lineHeight: '1.45',
          color: 'var(--text-primary)',
          fontSize: '0.92rem'
        }}>
          {content}
        </li>
      );
    }

    // Standard text line
    const content = parseInlineBold(line);
    return (
      <p key={idx} style={{ 
        margin: '0 0 0.4rem', 
        lineHeight: '1.45', 
        color: 'var(--text-primary)',
        fontSize: '0.92rem'
      }}>
        {content}
      </p>
    );
  });
}

function parseInlineBold(text) {
  const parts = text.split('**');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} style={{ color: '#ffffff', fontWeight: '700' }}>{part}</strong>;
    }
    return part;
  });
}
