import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ActionPlan from '../components/Dashboard/ActionPlan';
import './MedicalHistoryPage.css';

export default function MedicalHistoryPage() {
  const navigate = useNavigate();
  const { medicalHistory, searchHistory, clearMedicalHistory, clearSearchHistory } = useApp();
  
  const [activeTab, setActiveTab] = useState('medical'); // 'medical' | 'search'
  const [expandedId, setExpandedId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const activeHistory = activeTab === 'medical' ? medicalHistory : searchHistory;

  // Sort history: most recent first
  const sortedHistory = [...activeHistory].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const clearHistory = () => {
    if (activeTab === 'medical') {
      clearMedicalHistory();
    } else {
      clearSearchHistory();
    }
    setShowConfirm(false);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown date';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUrgencyLabel = (urgency) => {
    if (urgency === undefined || urgency === null) {
      return { label: 'Low', className: 'low' };
    }
    const u = String(urgency).toLowerCase();
    if (u.includes('emergency') || u.includes('critical') || u.includes('critical') || u.includes('4') || u.includes('5')) {
      return { label: 'Emergency', className: 'emergency' };
    }
    if (u.includes('high') || u.includes('severe') || u.includes('3')) {
      return { label: 'High', className: 'high' };
    }
    return { label: 'Low', className: 'low' };
  };

  const getSearchIcon = (type) => {
    switch (type) {
      case 'Facility Search': return '🏥';
      case 'Drug Guidelines': return '💊';
      case 'Scheme Matching': return '📋';
      default: return '🩺';
    }
  };

  return (
    <div className="medical-history-page animate-fadeIn">
      {/* Header */}
      <div className="mh-header">
        <div className="mh-header-text">
          <h1>Consultation & Search <span>History</span></h1>
          <p>Separate tracking for clinical patient records and general health inquiries</p>
        </div>
        {sortedHistory.length > 0 && (
          <button className="mh-clear-btn btn btn-danger" onClick={() => setShowConfirm(true)}>
            🗑️ Clear {activeTab === 'medical' ? 'Medical' : 'Search'} History
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="mh-tabs glass-card">
        <button 
          className={`mh-tab ${activeTab === 'medical' ? 'active' : ''}`}
          onClick={() => { setActiveTab('medical'); setExpandedId(null); }}
        >
          🩺 Clinical Medical History ({medicalHistory.length})
        </button>
        <button 
          className={`mh-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => { setActiveTab('search'); setExpandedId(null); }}
        >
          🔍 Information Search History ({searchHistory.length})
        </button>
      </div>

      {/* Empty State */}
      {sortedHistory.length === 0 ? (
        <div className="mh-empty glass-card">
          <div className="mh-empty-icon">{activeTab === 'medical' ? '📋' : '🔍'}</div>
          <h3>No Records Found</h3>
          <p>
            {activeTab === 'medical' 
              ? 'Patient symptom diagnostic consultations will appear here.'
              : 'Informational hospital searches, drug checks, and health FAQs will appear here.'}
          </p>
          <button className="mh-empty-cta btn btn-primary" onClick={() => navigate('/chat')}>
            💬 Go to Chat Assistant
          </button>
        </div>
      ) : (
        /* History Timeline/List */
        <div className="mh-timeline">
          {sortedHistory.map((entry, idx) => {
            const id = entry.id || idx;
            const isExpanded = expandedId === id;

            if (activeTab === 'medical') {
              const urgency = getUrgencyLabel(entry.urgency);
              return (
                <div key={id} className="mh-card glass-card">
                  <div className="mh-card-header">
                    <span className="mh-card-date">
                      🕐 {formatDate(entry.timestamp)}
                    </span>
                    <span className={`mh-urgency-badge ${urgency.className}`}>
                      {urgency.className === 'emergency' ? '🚨' : '●'} {urgency.label} Urgency
                    </span>
                  </div>

                  <div className="mh-symptoms">
                    <strong>Symptoms: </strong> {entry.symptoms}
                  </div>

                  {entry.summary && (
                    <div className="mh-summary">
                      {entry.summary}
                    </div>
                  )}

                  <button className="mh-expand-btn btn btn-ghost" onClick={() => toggleExpand(id)}>
                    <span className={`mh-expand-icon ${isExpanded ? 'open' : ''}`}>▼</span>
                    {isExpanded ? 'Hide Assessment Details' : 'View Full Care Roadmap'}
                  </button>

                  {isExpanded && entry.actionPlan && (
                    <div className="mh-details animate-slideDown">
                      <ActionPlan actionPlan={entry.actionPlan} compact={true} />
                    </div>
                  )}
                </div>
              );
            } else {
              // Search History layout
              return (
                <div key={id} className="mh-card glass-card mh-card--search">
                  <div className="mh-card-header">
                    <span className="mh-card-date">
                      🕐 {formatDate(entry.timestamp)}
                    </span>
                    <span className="mh-search-type-badge">
                      {getSearchIcon(entry.searchType)} {entry.searchType}
                    </span>
                  </div>

                  <div className="mh-symptoms">
                    <strong>Search Query: </strong> "{entry.symptoms}"
                  </div>

                  {entry.summary && (
                    <div className="mh-summary" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {entry.summary.length > 150 && !isExpanded 
                        ? `${entry.summary.slice(0, 150)}...` 
                        : entry.summary}
                    </div>
                  )}

                  <button className="mh-expand-btn btn btn-ghost" onClick={() => toggleExpand(id)}>
                    <span className={`mh-expand-icon ${isExpanded ? 'open' : ''}`}>▼</span>
                    {isExpanded ? 'Hide Details' : 'View Full Query Response'}
                  </button>

                  {isExpanded && entry.summary && (
                    <div className="mh-details-markdown animate-slideDown glass-card">
                      <div style={{ whiteSpace: 'pre-wrap', padding: '1rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        {entry.summary}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          })}
        </div>
      )}

      {/* Confirm Clear Modal */}
      {showConfirm && (
        <div className="mh-confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="mh-confirm-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <h3>🗑️ Clear {activeTab === 'medical' ? 'Medical' : 'Search'} History?</h3>
            <p>This will permanently wipe all {sortedHistory.length} record{sortedHistory.length !== 1 ? 's' : ''} in this tab. This action cannot be undone.</p>
            <div className="mh-confirm-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={clearHistory}>
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
