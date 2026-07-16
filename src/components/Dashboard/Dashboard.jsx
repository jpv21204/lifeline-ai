import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { messages, analyticsData } = useApp();

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

  // Mock community health trends (using CSS bar charts)
  const trends = [
    { name: 'Fever / Flu', percentage: 75, color: '#3b82f6', count: 142 },
    { name: 'Respiratory / Cough', percentage: 55, color: '#00d4aa', count: 98 },
    { name: 'Maternal Care', percentage: 40, color: '#7c3aed', count: 68 },
    { name: 'Hypertension / BP', percentage: 30, color: '#f59e0b', count: 52 },
    { name: 'Dengue Suspected', percentage: 15, color: '#ef4444', count: 18 }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>📊 Community Health & Agent Analytics</h2>
        <p className="subtitle">Real-time statistics on AI system coordination and community concerns.</p>
      </div>

      {/* Analytics Overview Grid */}
      <div className="analytics-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <span className="stat-value">{analyticsData.totalQueries}</span>
            <span className="stat-label">Total Health Queries</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-info">
            <span className="stat-value">8 / 8</span>
            <span className="stat-label">Agents Operational</span>
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
            <span className="stat-label">Avg Coordination Time</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-info">
            <span className="stat-value">{analyticsData.emergencyCount}</span>
            <span className="stat-label">Emergencies Flagged</span>
          </div>
        </div>
      </div>

      <div className="dashboard-body-grid">
        {/* Community Health Trends */}
        <div className="trends-card glass-card">
          <h4>📈 Community Health Concern Trends</h4>
          <p className="card-desc">Anonymized symptom tracking for district healthcare response.</p>
          <div className="trends-list">
            {trends.map((t, idx) => (
              <div key={idx} className="trend-item">
                <div className="trend-info">
                  <span className="trend-name">{t.name}</span>
                  <span className="trend-count">{t.count} cases</span>
                </div>
                <div className="trend-bar-wrapper">
                  <div 
                    className="trend-bar" 
                    style={{ width: `${t.percentage}%`, backgroundColor: t.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="trends-footer-tip">
            💡 <strong>District Alert:</strong> Malaria/Dengue season. Mosquito control suggested in Karimnagar/Warangal districts.
          </div>
        </div>

        {/* Recent Consultations */}
        <div className="recent-card glass-card">
          <h4>🕒 Your Recent Consultations</h4>
          {pastAssessments.length === 0 ? (
            <div className="empty-recent">
              <div className="empty-icon">🩺</div>
              <p>No consultations logged yet.</p>
              <p className="subtext">Start chatting with LifeLine AI to generate your health assessments.</p>
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
                    <span className={`recent-urg-badge ${a.urgency.toLowerCase()}`}>{a.urgency}</span>
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
        <h4>⚡ Quick Actions</h4>
        <div className="actions-grid">
          <div className="action-tile glass-card" onClick={() => navigate('/chat')}>
            <span className="tile-icon">🩺</span>
            <h5>Start Symptom Check</h5>
            <p>Describe your issue and get guidance.</p>
          </div>
          <div className="action-tile glass-card" onClick={() => navigate('/schemes')}>
            <span className="tile-icon">📋</span>
            <h5>Browse Govt Schemes</h5>
            <p>Check eligibility for state & national plans.</p>
          </div>
          <div className="action-tile glass-card" onClick={() => alert('Feature coming soon: Offline community database download.')}>
            <span className="tile-icon">📲</span>
            <h5>Download Offline DB</h5>
            <p>Save healthcare listings to phone storage.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
