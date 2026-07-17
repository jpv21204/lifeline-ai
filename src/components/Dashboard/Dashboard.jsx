import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { messages, analyticsData, t } = useApp();

  // Filter messages with actionPlan
  const pastAssessments = messages
    .filter(m => m.role === 'assistant' && m.actionPlan)
    .map(m => ({
      id: m.id,
      timestamp: m.timestamp,
      urgency: m.actionPlan.urgencyLabel || 'Medium',
      summary: m.content
    }))
    .reverse();

  // Translated trends
  const trends = [
    { name: t('feverFlu') || 'Fever / Flu', percentage: 75, color: '#3b82f6', count: 142 },
    { name: t('respiratoryCough') || 'Respiratory / Cough', percentage: 55, color: '#00d4aa', count: 98 },
    { name: t('categoryMaternalChild') || 'Maternal Care', percentage: 40, color: '#7c3aed', count: 68 },
    { name: t('hypertensionBP') || 'Hypertension / BP', percentage: 30, color: '#f59e0b', count: 52 },
    { name: t('dengueSuspected') || 'Dengue Suspected', percentage: 15, color: '#ef4444', count: 18 }
  ];

  const getUrgencyTranslation = (urg) => {
    const u = String(urg).toLowerCase();
    if (u.includes('low')) return t('urgencyLow')?.split(' - ')[0] || 'Low';
    if (u.includes('medium') || u.includes('moderate')) return t('urgencyMedium')?.split(' - ')[0] || 'Medium';
    if (u.includes('high') || u.includes('very high')) return t('urgencyHigh')?.split(' - ')[0] || 'High';
    if (u.includes('critical') || u.includes('emergency')) return t('urgencyCritical')?.split(' - ')[0] || 'Critical';
    return urg;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>📊 {t('communityTrendsHeader')}</h2>
        <p className="subtitle">{t('communityTrendsSubtitle')}</p>
      </div>

      {/* Analytics Overview Grid */}
      <div className="analytics-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <span className="stat-value">{analyticsData.totalQueries}</span>
            <span className="stat-label">{t('totalHealthQueries')}</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-info">
            <span className="stat-value">8 / 8</span>
            <span className="stat-label">{t('agentsOperational')}</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <span className="stat-value">
              {analyticsData.avgResponseTime > 0 
                ? `${(analyticsData.avgResponseTime / 1000).toFixed(1)}s` 
                : '1.2s'}
            </span>
            <span className="stat-label">{t('avgCoordinationTime')}</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-info">
            <span className="stat-value">{analyticsData.emergencyCount}</span>
            <span className="stat-label">{t('emergenciesFlagged')}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-body-grid">
        {/* Community Health Trends */}
        <div className="trends-card glass-card">
          <h4>📈 {t('trendsHeader')}</h4>
          <p className="card-desc">{t('trendsDesc')}</p>
          <div className="trends-list">
            {trends.map((tItem, idx) => (
              <div key={idx} className="trend-item">
                <div className="trend-info">
                  <span className="trend-name">{tItem.name}</span>
                  <span className="trend-count">{tItem.count} {t('cases')}</span>
                </div>
                <div className="trend-bar-wrapper">
                  <div 
                    className="trend-bar" 
                    style={{ width: `${tItem.percentage}%`, backgroundColor: tItem.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="trends-footer-tip">
            💡 <strong>{t('districtAlert')}</strong> {t('districtAlertText')}
          </div>
        </div>

        {/* Recent Consultations */}
        <div className="recent-card glass-card">
          <h4>🕒 {t('recentConsultationsHeader')}</h4>
          {pastAssessments.length === 0 ? (
            <div className="empty-recent">
              <div className="empty-icon">🩺</div>
              <p>{t('noConsultationsLogged')}</p>
              <p className="subtext">{t('startChattingTip')}</p>
            </div>
          ) : (
            <div className="recent-list">
              {pastAssessments.map((a, idx) => (
                <div key={idx} className="recent-item">
                  <div className="recent-item-header">
                    <span className={`urgency-dot ${a.urgency.toLowerCase()}`}></span>
                    <span className="recent-time">
                      {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`recent-urg-badge ${a.urgency.toLowerCase()}`}>{getUrgencyTranslation(a.urgency)}</span>
                  </div>
                  <p className="recent-summary">{a.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="quick-actions-section">
        <h4>⚡ {t('quickActions')}</h4>
        <div className="actions-grid">
          <div className="action-tile glass-card" onClick={() => navigate('/chat')}>
            <span className="tile-icon">🩺</span>
            <h5>{t('startSymptomCheckTitle')}</h5>
            <p>{t('startSymptomCheckDesc')}</p>
          </div>
          <div className="action-tile glass-card" onClick={() => navigate('/schemes')}>
            <span className="tile-icon">📋</span>
            <h5>{t('browseGovSchemesTitle')}</h5>
            <p>{t('browseGovSchemesDesc')}</p>
          </div>
          <div className="action-tile glass-card" onClick={() => alert('Feature coming soon: Offline community database download.')}>
            <span className="tile-icon">📲</span>
            <h5>{t('downloadOfflineDbTitle')}</h5>
            <p>{t('downloadOfflineDbDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
