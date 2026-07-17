import React, { useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import ChatMessage from './ChatMessage';
import LoadingPulse from '../Common/LoadingPulse';
import './ChatWindow.css';

const SUGGESTED_PROMPTS = [
  { emoji: '🤒', text: 'My mother has had fever and cough for 4 days' },
  { emoji: '🤰', text: 'I am 7 months pregnant, what schemes am I eligible for?' },
  { emoji: '🚨', text: 'My father has chest pain and difficulty breathing!' },
  { emoji: '💊', text: 'What are the side effects of paracetamol?' },
];

const PROCESSING_MESSAGES = [
  'Health Assessment Agent analyzing symptoms...',
  'Emergency Detection Agent checking urgency...',
  'Hospital Finder Agent locating nearby facilities...',
  'Government Scheme Agent checking eligibility...',
  'Compiling your personalized health plan...',
];

export default function ChatWindow() {
  const { messages, isProcessing, sendMessage, agentStatuses, t } = useApp();
  const bottomRef = useRef(null);
  const processingMsgRef = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  /* Cycle through processing messages */
  useEffect(() => {
    if (!isProcessing) { processingMsgRef.current = 0; return; }
    const interval = setInterval(() => {
      processingMsgRef.current = (processingMsgRef.current + 1) % PROCESSING_MESSAGES.length;
    }, 2500);
    return () => clearInterval(interval);
  }, [isProcessing]);

  /* Find current processing agent */
  const activeAgent = Object.entries(agentStatuses).find(([, s]) => s.status === 'processing');
  const activeAgentName = activeAgent ? activeAgent[0].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : null;
  const loadingText = activeAgentName
    ? `${activeAgentName} Agent analyzing...`
    : 'Processing your query...';

  return (
    <div className="chat-window">
      {messages.length === 0 && !isProcessing ? (
        /* Empty state / welcome */
        <div className="chat-window__empty">
          <div className="chat-window__welcome animate-fadeInUp">
            <div className="chat-window__welcome-icon">🩺</div>
            <h2 className="chat-window__welcome-title">
              {t('welcome')}
            </h2>
            <p className="chat-window__welcome-desc">
              {t('tagline')}
            </p>
          </div>
        </div>
      ) : (
        /* Messages */
        <div className="chat-window__messages">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isProcessing && (
            <div className="chat-window__typing animate-fadeIn">
              <div className="chat-window__typing-card glass-card">
                <LoadingPulse text={loadingText} size="sm" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
