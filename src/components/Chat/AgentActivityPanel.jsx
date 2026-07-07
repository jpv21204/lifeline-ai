import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import './AgentActivityPanel.css';

const AGENT_COLORS = {
  health_assessment: '#00d4aa',
  emergency_detection: '#ef4444',
  hospital_finder: '#3b82f6',
  government_scheme: '#f59e0b',
  medicine_info: '#ec4899',
  followup: '#8b5cf6',
  translation: '#06b6d4',
  analytics: '#10b981',
};

export default function AgentActivityPanel() {
  const { agents, agentStatuses, isProcessing } = useApp();

  const activeCount = useMemo(
    () => Object.values(agentStatuses).filter(s => s.status === 'processing').length,
    [agentStatuses]
  );
  const completeCount = useMemo(
    () => Object.values(agentStatuses).filter(s => s.status === 'complete').length,
    [agentStatuses]
  );
  const totalTime = useMemo(
    () => Object.values(agentStatuses).reduce((sum, s) => sum + (s.time || 0), 0),
    [agentStatuses]
  );

  return (
    <aside className="agent-panel">
      {/* Header */}
      <div className="agent-panel__header">
        <div className="agent-panel__header-top">
          <span className="agent-panel__brain">🧠</span>
          <div>
            <h3 className="agent-panel__title">Orchestrator</h3>
            <p className="agent-panel__subtitle">Multi-Agent Pipeline</p>
          </div>
        </div>
        <div className={`agent-panel__status-indicator ${isProcessing ? 'agent-panel__status-indicator--active' : ''}`}>
          {isProcessing ? (
            <>
              <div className="agent-panel__ripple">
                <span /><span /><span />
              </div>
              <span className="agent-panel__status-label">Processing</span>
            </>
          ) : (
            <>
              <span className="agent-panel__idle-dot" />
              <span className="agent-panel__status-label">Ready</span>
            </>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="agent-panel__stats">
        <div className="agent-panel__stat">
          <span className="agent-panel__stat-value">{activeCount}</span>
          <span className="agent-panel__stat-label">Active</span>
        </div>
        <div className="agent-panel__stat">
          <span className="agent-panel__stat-value">{completeCount}</span>
          <span className="agent-panel__stat-label">Done</span>
        </div>
        <div className="agent-panel__stat">
          <span className="agent-panel__stat-value">{totalTime ? `${(totalTime / 1000).toFixed(1)}s` : '—'}</span>
          <span className="agent-panel__stat-label">Total</span>
        </div>
      </div>

      {/* Pipeline visualization */}
      <div className="agent-panel__pipeline">
        {agents.map((agent, i) => {
          const status = agentStatuses[agent.id];
          const color = AGENT_COLORS[agent.id] || '#64748b';
          const isActive = status?.status === 'processing';
          const isDone = status?.status === 'complete';
          const isError = status?.status === 'error';

          return (
            <React.Fragment key={agent.id}>
              {/* Connection line */}
              {i > 0 && (
                <div className={`agent-panel__connector ${isDone || isActive ? 'agent-panel__connector--active' : ''}`}>
                  <div className="agent-panel__connector-line" style={{ borderColor: isDone ? color : undefined }} />
                  {isActive && <div className="agent-panel__connector-pulse" style={{ background: color }} />}
                </div>
              )}

              {/* Agent card */}
              <div
                className={`agent-panel__card ${isActive ? 'agent-panel__card--active' : ''} ${isDone ? 'agent-panel__card--complete' : ''} ${isError ? 'agent-panel__card--error' : ''}`}
                style={{
                  '--agent-color': color,
                  animationDelay: `${i * 0.06}s`,
                }}
              >
                <div className="agent-panel__card-left">
                  <div className={`agent-panel__card-icon ${isActive ? 'agent-panel__card-icon--active' : ''}`}>
                    {agent.emoji}
                  </div>
                  <div className="agent-panel__card-info">
                    <span className="agent-panel__card-name">{agent.name.replace(' Agent', '')}</span>
                    <span className="agent-panel__card-status">
                      {isActive && 'Analyzing...'}
                      {isDone && `Done in ${status.time}ms`}
                      {isError && 'Error'}
                      {!isActive && !isDone && !isError && 'Standby'}
                    </span>
                  </div>
                </div>
                <div className="agent-panel__card-right">
                  {isActive && (
                    <div className="agent-panel__spinner" style={{ borderTopColor: color, borderColor: `${color}30` }} />
                  )}
                  {isDone && (
                    <div className="agent-panel__check" style={{ color }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                  {isError && (
                    <div className="agent-panel__error-icon">✕</div>
                  )}
                  {!isActive && !isDone && !isError && (
                    <div className="agent-panel__idle" />
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="agent-panel__footer">
        <p className="agent-panel__footer-text">
          <span className="agent-panel__footer-icon">⚡</span>
          Agents process in parallel with intelligent routing
        </p>
      </div>
    </aside>
  );
}
