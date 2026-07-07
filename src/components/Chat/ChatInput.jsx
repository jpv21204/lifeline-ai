import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './ChatInput.css';

export default function ChatInput() {
  const { sendMessage, isProcessing } = useApp();
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  /* Auto-resize textarea */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim() || isProcessing) return;
    sendMessage(value);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-input">
      <div className="chat-input__wrapper glass-card">
        {/* Mic icon (decorative) */}
        <button className="chat-input__mic btn btn-ghost btn-icon" title="Voice input (coming soon)" disabled>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          className="chat-input__textarea"
          placeholder="Describe your symptoms or ask about health schemes..."
          rows={1}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
        />

        <button
          className={`chat-input__send btn btn-primary btn-icon--lg ${!value.trim() || isProcessing ? 'chat-input__send--disabled' : ''}`}
          onClick={handleSubmit}
          disabled={!value.trim() || isProcessing}
          title="Send message"
        >
          {isProcessing ? (
            <div className="agent-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </button>
      </div>
      <p className="chat-input__hint">Press Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
