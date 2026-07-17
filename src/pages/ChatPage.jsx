import React, { useState } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import ChatInput from '../components/Chat/ChatInput';
import { useApp } from '../context/AppContext';
import './ChatPage.css';

export default function ChatPage() {
  const { t } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="chat-page-container">
      {/* Mobile control bar */}
      <div className="mobile-chat-controls">
        <button 
          className="mobile-btn" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          👤 {t('profile')}
        </button>
      </div>

      <div className="chat-layout-grid">
        {/* Left column: Sidebar / Profile */}
        <div className={`chat-sidebar-col ${isSidebarOpen ? 'open' : ''}`}>
          <div className="mobile-close-header">
            <h4>{t('profile')}</h4>
            <button onClick={() => setIsSidebarOpen(false)}>✕</button>
          </div>
          <Sidebar />
        </div>

        {/* Center column: Chat Window */}
        <div className="chat-window-col">
          <ChatWindow />
          <ChatInput />
        </div>
      </div>

      {/* Backdrop for mobile drawer overlays */}
      {isSidebarOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
