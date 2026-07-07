import React, { useState } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import AgentActivityPanel from '../components/Chat/AgentActivityPanel';
import './ChatPage.css';

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAgentPanelOpen, setIsAgentPanelOpen] = useState(false);

  return (
    <div className="chat-page-container">
      {/* Mobile control bar */}
      <div className="mobile-chat-controls">
        <button 
          className="mobile-btn" 
          onClick={() => {
            setIsSidebarOpen(!isSidebarOpen);
            setIsAgentPanelOpen(false);
          }}
        >
          👤 Profile Form
        </button>
        <button 
          className="mobile-btn" 
          onClick={() => {
            setIsAgentPanelOpen(!isAgentPanelOpen);
            setIsSidebarOpen(false);
          }}
        >
          🧠 Active Agents
        </button>
      </div>

      <div className="chat-layout-grid">
        {/* Left column: Sidebar / Profile */}
        <div className={`chat-sidebar-col ${isSidebarOpen ? 'open' : ''}`}>
          <div className="mobile-close-header">
            <h4>User Health Profile</h4>
            <button onClick={() => setIsSidebarOpen(false)}>✕</button>
          </div>
          <Sidebar />
        </div>

        {/* Center column: Chat Window */}
        <div className="chat-window-col">
          <ChatWindow />
        </div>

        {/* Right column: Agent Activity Visualization */}
        <div className={`chat-agents-col ${isAgentPanelOpen ? 'open' : ''}`}>
          <div className="mobile-close-header">
            <h4>AI Agent Activity</h4>
            <button onClick={() => setIsAgentPanelOpen(false)}>✕</button>
          </div>
          <AgentActivityPanel />
        </div>
      </div>

      {/* Backdrop for mobile drawer overlays */}
      {(isSidebarOpen || isAgentPanelOpen) && (
        <div 
          className="mobile-overlay" 
          onClick={() => {
            setIsSidebarOpen(false);
            setIsAgentPanelOpen(false);
          }}
        ></div>
      )}
    </div>
  );
}
