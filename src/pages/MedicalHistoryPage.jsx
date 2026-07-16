import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MedicalHistoryPage.css';

export default function MedicalHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('lifeline_medical_history') || '[]');
      const entries = Array.isArray(stored) ? stored : [];
      // Sort by date, most recent first
      entries.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));
      setHistory(entries);
    } catch {
      setHistory([]);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('lifeline_medical_history');
    setHistory([]);
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
    if (!urgency) return { label: 'Unknown', className: 'moderate' };
    const u = urgency.toLowerCase();
    if (u.includes('emergency') || u.includes('critical')) return { label: 'Emergency', className: 'emergency' };
    if (u.includes('high') || u.includes('severe')) return { label: 'High', className: 'high' };
    if (u.includes('moderate') || u.includes('medium')) return { label: 'Moderate', className: 'moderate' };
    return { label: 'Low', className: 'low' };
  };

  // Empty state
  if (history.length === 0) {
    return (
      <div className="medical-history-page">
        <div className="mh-header">
          <div className="mh-header-text">
            <h1>Medical <span>History</span></h1>
            <p>Your past consultations and health records</p>
          </div>
        </div>
        <div className="mh-empty">
          <div className="mh-empty-icon">📋</div>
          <h3>No Consultations Yet</h3>
          <p>
            Your medical history will appear here after you complete your first AI-powered health consultation.
          </p>
          <button className="mh-empty-cta" onClick={() => navigate('/chat')}>
            🩺 Start a Consultation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="medical-history-page">
      {/* Header */}
      <div className="mh-header">
        <div className="mh-header-text">
          <h1>Medical <span>History</span></h1>
          <p>Your past consultations and health records</p>
          <div className="mh-count-badge">
            📊 {history.length} consultation{history.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button className="mh-clear-btn" onClick={() => setShowConfirm(true)}>
          🗑️ Clear History
        </button>
      </div>

      {/* Timeline */}
      <div className="mh-timeline">
        {history.map((entry, idx) => {
          const id = entry.id || idx;
          const urgency = getUrgencyLabel(entry.urgency || entry.urgencyLevel);
          const isExpanded = expandedId === id;

          return (
            <div key={id} className="mh-card">
              {/* Card Header */}
              <div className="mh-card-header">
                <span className="mh-card-date">
                  🕐 {formatDate(entry.date || entry.timestamp)}
                </span>
                <span className={`mh-urgency-badge ${urgency.className}`}>
                  {urgency.className === 'emergency' ? '🚨' : urgency.className === 'high' ? '⚠️' : '●'} {urgency.label}
                </span>
              </div>

              {/* Symptoms */}
              <div className="mh-symptoms">
                {entry.symptoms || entry.query || 'Health Consultation'}
              </div>

              {/* Summary */}
              {(entry.summary || entry.actionPlan) && (
                <div className="mh-summary">
                  {entry.summary || entry.actionPlan}
                </div>
              )}

              {/* Expand Toggle */}
              <button className="mh-expand-btn" onClick={() => toggleExpand(id)}>
                <span className={`mh-expand-icon ${isExpanded ? 'open' : ''}`}>▼</span>
                {isExpanded ? 'Hide Details' : 'View Details'}
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mh-details">
                  {entry.assessment && (
                    <div className="mh-detail-section">
                      <div className="mh-detail-label">Assessment</div>
                      <div className="mh-detail-content">
                        {typeof entry.assessment === 'string' ? entry.assessment : JSON.stringify(entry.assessment, null, 2)}
                      </div>
                    </div>
                  )}

                  {entry.hospitals && (
                    <div className="mh-detail-section">
                      <div className="mh-detail-label">Recommended Hospitals</div>
                      <div className="mh-detail-content">
                        {typeof entry.hospitals === 'string' ? entry.hospitals : JSON.stringify(entry.hospitals, null, 2)}
                      </div>
                    </div>
                  )}

                  {entry.medicines && (
                    <div className="mh-detail-section">
                      <div className="mh-detail-label">Medicine Information</div>
                      <div className="mh-detail-content">
                        {typeof entry.medicines === 'string' ? entry.medicines : JSON.stringify(entry.medicines, null, 2)}
                      </div>
                    </div>
                  )}

                  {entry.schemes && (
                    <div className="mh-detail-section">
                      <div className="mh-detail-label">Government Schemes</div>
                      <div className="mh-detail-content">
                        {typeof entry.schemes === 'string' ? entry.schemes : JSON.stringify(entry.schemes, null, 2)}
                      </div>
                    </div>
                  )}

                  {entry.followUp && (
                    <div className="mh-detail-section">
                      <div className="mh-detail-label">Follow-up Plan</div>
                      <div className="mh-detail-content">
                        {typeof entry.followUp === 'string' ? entry.followUp : JSON.stringify(entry.followUp, null, 2)}
                      </div>
                    </div>
                  )}

                  {entry.agentResults && (
                    <div className="mh-detail-section">
                      <div className="mh-detail-label">Full Agent Results</div>
                      <div className="mh-detail-content">
                        {typeof entry.agentResults === 'string' ? entry.agentResults : JSON.stringify(entry.agentResults, null, 2)}
                      </div>
                    </div>
                  )}

                  {/* Fallback if no specific detail fields exist */}
                  {!entry.assessment && !entry.hospitals && !entry.medicines && !entry.schemes && !entry.followUp && !entry.agentResults && (
                    <div className="mh-detail-section">
                      <div className="mh-detail-label">Full Record</div>
                      <div className="mh-detail-content">
                        {JSON.stringify(entry, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm Clear Modal */}
      {showConfirm && (
        <div className="mh-confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="mh-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🗑️ Clear Medical History?</h3>
            <p>This will permanently delete all {history.length} consultation record{history.length !== 1 ? 's' : ''}. This action cannot be undone.</p>
            <div className="mh-confirm-actions">
              <button className="mh-confirm-cancel" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="mh-confirm-delete" onClick={clearHistory}>
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
