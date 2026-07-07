import React from 'react';
import ActionPlan from '../Dashboard/ActionPlan';
import './ChatMessage.css';

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

  return (
    <div className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--assistant'} animate-fadeInUp`}>
      {!isUser && (
        <div className="chat-message__avatar">
          <span>🤖</span>
        </div>
      )}

      <div className="chat-message__body">
        <div className={`chat-message__bubble ${isUser ? '' : 'glass-card'}`}>
          {/* Main text */}
          <p className="chat-message__text">{message.content}</p>

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
