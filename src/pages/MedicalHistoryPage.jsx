import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ActionPlan from '../components/Dashboard/ActionPlan';
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
      entries.sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));
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
    if (urgency === undefined || urgency === null) {
      return { label: 'Unknown', className: 'moderate' };
    }

    if (typeof urgency === 'number') {
      const labels = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Very High', 5: 'Critical' };
      const classes = { 1: 'low', 2: 'moderate', 3: 'high', 4: 'high', 5: 'emergency' };
      return {
        label: labels[urgency] || 'Medium',
        className: classes[urgency] || 'moderate'
      };
    }

    const u = String(urgency).toLowerCase();
    if (u.includes('emergency') || u.includes('critical') || u.includes('5')) {
      return { label: 'Emergency', className: 'emergency' };
    }
    if (u.includes('high') || u.includes('severe') || u.includes('4') || u.includes('3')) {
      return { label: 'High', className: 'high' };
    }
    if (u.includes('moderate') || u.includes('medium') || u.includes('2')) {
      return { label: 'Moderate', className: 'moderate' };
    }
    return { label: 'Low', className: 'low' };
  };

  // Empty state
  if (history.length === 0) {
    return (
      <div className="medical-history-page animate-fadeIn">
        <div className="mh-header">
          <div className="mh-header-text">
            <h1>Medical <span>History</span></h1>
            <p>Your past consultations and health records</p>
          </div>
        </div>
        <div className="mh-empty glass-card">
          <div className="mh-empty-icon">📋</div>
          <h3>No Consultations Yet</h3>
          <p>
            Your medical history will appear here after you complete your first AI-powered health consultation.
          </p>
          <button className="mh-empty-cta btn btn-primary" onClick={() => navigate('/chat')}>
            🩺 Start a Consultation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="medical-history-page animate-fadeIn">
      {/* Header */}
      <div className="mh-header">
        <div className="mh-header-text">
          <h1>Medical <span>History</span></h1>
          <p>Your past consultations and health records</p>
          <div className="mh-count-badge">
            📊 {history.length} consultation{history.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button className="mh-clear-btn btn btn-danger" onClick={() => setShowConfirm(true)}>
          🗑️ Clear History
        </button>
      </div>

      {/* Timeline */}
      <div className="mh-timeline">
        {history.map((entry, idx) => {
          const id = entry.id || idx;
          const urgency = getUrgencyLabel(entry.urgency);
          const isExpanded = expandedId === id;

          return (
            <div key={id} className="mh-card glass-card">
              {/* Card Header */}
              <div className="mh-card-header">
                <span className="mh-card-date">
                  🕐 {formatDate(entry.timestamp || entry.date)}
                </span>
                <span className={`mh-urgency-badge ${urgency.className}`}>
                  {urgency.className === 'emergency' ? '🚨' : urgency.className === 'high' ? '⚠️' : '●'} {urgency.label}
                </span>
              </div>

              {/* Symptoms */}
              <div className="mh-symptoms">
                <strong>Symptoms: </strong> {entry.symptoms || 'Health Consultation'}
              </div>

              {/* Summary */}
              {entry.summary && typeof entry.summary === 'string' && (
                <div className="mh-summary">
                  {entry.summary}
                </div>
              )}

              {/* Expand Toggle */}
              <button className="mh-expand-btn btn btn-ghost" onClick={() => toggleExpand(id)}>
                <span className={`mh-expand-icon ${isExpanded ? 'open' : ''}`}>▼</span>
                {isExpanded ? 'Hide Details' : 'View Action Plan'}
              </button>

              {/* Expanded Details - Render ActionPlan directly */}
              {isExpanded && entry.actionPlan && (
                <div className="mh-details animate-slideDown">
                  <ActionPlan actionPlan={entry.actionPlan} compact={true} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm Clear Modal */}
      {showConfirm && (
        <div className="mh-confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="mh-confirm-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <h3>🗑️ Clear Medical History?</h3>
            <p>This will permanently delete all {history.length} consultation record{history.length !== 1 ? 's' : ''}. This action cannot be undone.</p>
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
