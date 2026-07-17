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
          <div className="chat-message__text-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <p className="chat-message__text">{message.content}</p>
            {!isUser && (
              <button 
                type="button"
                className={`chat-message__speak-btn ${isPlaying ? 'speaking' : ''}`} 
                onClick={() => speak(message.content)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.15rem', opacity: isPlaying ? 1 : 0.4, transition: 'opacity 0.2s', padding: '0.1rem 0.2rem', userSelect: 'none' }}
                title={isPlaying ? "Stop speaking" : "Speak response"}
              >
                {isPlaying ? '⏹️' : '🔊'}
              </button>
            )}
          </div>

          {/* Agent attribution badges */}
          {!isUser && message.agentResults && (
            <div className="chat-message__agents">
              {Object.keys(message.agentResults).map(agentId => {
                const meta = AGENT_META[agentId];
                if (!meta) return null;
                return (
                  <span key={agentId} className="chat-message__agent-badge badge badge--neutral">
                    {meta.emoji} {meta.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Plan (assistant messages with actionPlan) */}
        {!isUser && message.actionPlan && (
          <div className="chat-message__action-plan animate-fadeInUp delay-2">
            <ActionPlan actionPlan={message.actionPlan} agentResults={message.agentResults} />
          </div>
        )}

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
