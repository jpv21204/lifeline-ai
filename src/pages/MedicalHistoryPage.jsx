import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ActionPlan from '../components/Dashboard/ActionPlan';
import './MedicalHistoryPage.css';

export default function MedicalHistoryPage() {
  const navigate = useNavigate();
  const { t } = useApp();
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
    if (!dateStr) return t('all') || 'Unknown date';
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
      return { label: t('all') || 'Unknown', className: 'moderate' };
    }

    if (typeof urgency === 'number') {
      const labels = { 
        1: t('urgencyLow') || 'Low', 
        2: t('urgencyMedium') || 'Medium', 
        3: t('urgencyHigh') || 'High', 
        4: t('urgencyHigh') || 'Very High', 
        5: t('urgencyCritical') || 'Critical' 
      };
      const classes = { 1: 'low', 2: 'moderate', 3: 'high', 4: 'high', 5: 'emergency' };
      return {
        label: labels[urgency] || 'Medium',
        className: classes[urgency] || 'moderate'
      };
    }

    const u = String(urgency).toLowerCase();
    if (u.includes('emergency') || u.includes('critical') || u.includes('5')) {
      return { label: t('urgencyCritical') || 'Emergency', className: 'emergency' };
    }
    if (u.includes('high') || u.includes('severe') || u.includes('4') || u.includes('3')) {
      return { label: t('urgencyHigh') || 'High', className: 'high' };
    }
    if (u.includes('moderate') || u.includes('medium') || u.includes('2')) {
      return { label: t('urgencyMedium') || 'Moderate', className: 'moderate' };
    }
    return { label: t('urgencyLow') || 'Low', className: 'low' };
  };

  // Empty state
  if (history.length === 0) {
    return (
      <div className="medical-history-page animate-fadeIn">
        <div className="mh-header">
          <div className="mh-header-text">
            <h1>{t('medicalHistoryTitle').split(' ')[0]} <span>{t('medicalHistoryTitle').split(' ')[1] || ''}</span></h1>
            <p>{t('medicalHistorySubtitle')}</p>
          </div>
        </div>
        <div className="mh-empty glass-card">
          <div className="mh-empty-icon">📋</div>
          <h3>{t('noConsultations')}</h3>
          <p>{t('noConsultationsDesc')}</p>
          <button className="mh-empty-cta btn btn-primary" onClick={() => navigate('/chat')}>
            🩺 {t('startConsultationMH')}
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
          <h1>{t('medicalHistoryTitle').split(' ')[0]} <span>{t('medicalHistoryTitle').split(' ')[1] || ''}</span></h1>
          <p>{t('medicalHistorySubtitle')}</p>
          <div className="mh-count-badge">
            📊 {history.length === 1 
              ? t('consultationCount').replace('{count}', history.length) 
              : t('consultationCountPlural').replace('{count}', history.length)}
          </div>
        </div>
        <button className="mh-clear-btn btn btn-danger" onClick={() => setShowConfirm(true)}>
          🗑️ {t('clearHistory')}
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
                <strong>{t('symptomsLabel')} </strong> {entry.symptoms || 'Health Consultation'}
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
                {isExpanded ? t('hideDetails') : t('viewActionPlan')}
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
            <h3>🗑️ {t('clearHistoryConfirm')}</h3>
            <p>
              {history.length === 1 
                ? t('clearHistoryDescSingle') 
                : t('clearHistoryDesc').replace('{count}', history.length)}
            </p>
            <div className="mh-confirm-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                {t('cancel')}
              </button>
              <button className="btn btn-danger" onClick={clearHistory}>
                {t('deleteAll')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
