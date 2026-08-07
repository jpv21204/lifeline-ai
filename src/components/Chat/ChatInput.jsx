import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './ChatInput.css';

const LANG_LOCALES = {
  en: 'en-US', te: 'te-IN', hi: 'hi-IN', ta: 'ta-IN', kn: 'kn-IN',
  ml: 'ml-IN', bn: 'bn-IN', pa: 'pa-IN', mr: 'mr-IN', gu: 'gu-IN',
  or: 'or-IN', ur: 'ur-PK'
};

export default function ChatInput() {
  const { sendMessage, isProcessing, currentLanguage, t } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [value, setValue] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = LANG_LOCALES[currentLanguage] || 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setValue(prev => (prev ? prev + ' ' + transcript : transcript));
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG, WEBP) of your prescription, lab report, or symptom.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64Data = dataUrl.split(',')[1];
      setAttachedImage({
        fileName: file.name,
        mimeType: file.type,
        data: base64Data,
        previewUrl: dataUrl
      });
    };
    reader.readAsDataURL(file);
  };

  const clearAttachedImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* Auto-resize textarea */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [value]);

  const handleSubmit = () => {
    if ((!value.trim() && !attachedImage) || isProcessing) return;
    sendMessage(value, attachedImage);
    setValue('');
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      {/* Attached Image Preview Bar */}
      {attachedImage && (
        <div className="chat-input__image-preview glass-panel animate-fadeIn" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', marginBottom: 8, borderRadius: 12, background: 'rgba(0, 212, 170, 0.1)', border: '1px solid rgba(0, 212, 170, 0.3)' }}>
          <img src={attachedImage.previewUrl} alt="Prescription Upload" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />
          <div style={{ flex: 1, fontSize: '0.85rem', color: '#f1f5f9' }}>
            <div style={{ fontWeight: 600 }}>📷 {attachedImage.fileName}</div>
            <div style={{ fontSize: '0.75rem', color: '#00d4aa' }}>Gemini Vision Multimodal Scanner Ready</div>
          </div>
          <button type="button" onClick={clearAttachedImage} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>✕</button>
        </div>
      )}

      <div className="chat-input__wrapper glass-card">
        {/* Hidden File Input for Prescription / Rash / Document Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {/* Prescription / Image Upload Button */}
        <button
          type="button"
          className="chat-input__mic btn btn-ghost btn-icon"
          title="Upload Prescription, Lab Report or Rash Image (Gemini Vision)"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>

        {/* Mic icon (functional speech input) */}
        <button 
          type="button"
          className={`chat-input__mic btn btn-ghost btn-icon ${isListening ? 'chat-input__mic--listening' : ''}`} 
          title="Voice input (Speak in Telugu, Hindi, Tamil or English)" 
          onClick={toggleListening}
          style={isListening ? { color: '#ef4444' } : {}}
        >
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
          placeholder={attachedImage ? "Add notes about this image or press send..." : t('askSymptoms') + '...'}
          rows={1}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
        />

        <button
          className={`chat-input__send btn btn-primary btn-icon--lg ${(!value.trim() && !attachedImage) || isProcessing ? 'chat-input__send--disabled' : ''}`}
          onClick={handleSubmit}
          disabled={(!value.trim() && !attachedImage) || isProcessing}
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
      <p className="chat-input__hint">📷 Upload prescriptions / lab reports · 🎙️ Voice input supported · Press Enter to send</p>
    </div>
  );
}
