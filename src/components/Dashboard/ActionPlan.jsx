import React, { useState } from 'react';
import './ActionPlan.css';

export default function ActionPlan({ actionPlan, compact = false }) {
  const [activeSection, setActiveSection] = useState(null);

  if (!actionPlan) return null;

  const { urgencyLabel, isEmergency, summary, sections } = actionPlan;

  const getUrgencyClass = (label) => {
    switch (label?.toLowerCase()) {
      case 'critical':
      case 'very high':
        return 'urgency-critical';
      case 'high':
        return 'urgency-high';
      case 'medium':
        return 'urgency-medium';
      case 'low':
      default:
        return 'urgency-low';
    }
  };

  const renderSectionHeader = (title, icon, agentKey, priority) => (
    <div 
      className={`action-section-header ${activeSection === agentKey ? 'active' : ''}`}
      onClick={() => setActiveSection(activeSection === agentKey ? null : agentKey)}
    >
      <span className="section-icon">{icon}</span>
      <span className="section-title">{title}</span>
      <span className={`priority-badge ${priority || 'low'}`}>{priority || 'Info'}</span>
      <span className="expand-indicator">{activeSection === agentKey ? '▲' : '▼'}</span>
    </div>
  );

  return (
    <div className={`action-plan-card glass-card ${isEmergency ? 'emergency-glow' : ''}`}>
      <div className="action-plan-header">
        <h3>📋 Personalized Health Action Plan</h3>
        <div className={`urgency-badge ${getUrgencyClass(urgencyLabel)}`}>
          {urgencyLabel} Urgency
        </div>
      </div>

      <p className="action-plan-summary">{summary}</p>

      {/* Emergency Detection Section */}
      {sections.emergency_detection && (sections.emergency_detection.isEmergency || activeSection === 'emergency') && (
        <div className="action-section emergency-border">
          {renderSectionHeader('Emergency Critical Response', '📞', 'emergency', 'critical')}
          <div className="action-section-content show">
            <div className="emergency-alert-box">
              <p className="warning-text">{sections.emergency_detection.warningMessage || sections.emergency_detection.warning}</p>
              <a href={`tel:${sections.emergency_detection.emergencyNumber || '108'}`} className="emergency-call-btn">
                📞 CALL AMBULANCE ({sections.emergency_detection.emergencyNumber || '108'})
              </a>
            </div>
            
            <h4 className="sub-title">Immediate Actions Required:</h4>
            <ul className="action-list">
              {(sections.emergency_detection.emergencyActions || sections.emergency_detection.immediateActions || []).map((action, idx) => (
                <li key={idx} className="action-item-urgent">🚨 {action}</li>
              ))}
            </ul>

            {sections.emergency_detection.helplineNumbers && (
              <div className="helpline-grid">
                <div>🚑 Ambulance: <strong>{sections.emergency_detection.helplineNumbers.ambulance}</strong></div>
                <div>🩺 Health Helpline: <strong>{sections.emergency_detection.helplineNumbers.healthHelpline}</strong></div>
                <div>🧠 Mental Health: <strong>{sections.emergency_detection.helplineNumbers.mentalHealth}</strong></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Health Assessment Section */}
      {sections.health_assessment && (
        <div className="action-section">
          {renderSectionHeader('Symptom & Health Assessment', '🩺', 'health', 'medium')}
          <div className={`action-section-content ${activeSection === 'health' || !compact ? 'show' : ''}`}>
            <div className="info-grid">
              <div>
                <strong>Matched Symptoms:</strong>
                <div className="badge-container">
                  {(sections.health_assessment.matchedSymptoms || []).map((s, idx) => (
                    <span key={idx} className="symptom-badge">{s.name || s}</span>
                  ))}
                </div>
              </div>
              <div>
                <strong>Possible Conditions:</strong>
                <div className="badge-container">
                  {(sections.health_assessment.possibleConditions || []).map((c, idx) => (
                    <span key={idx} className="condition-badge">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            <h4 className="sub-title">Care Instructions:</h4>
            <ul className="list-styled">
              {(sections.health_assessment.recommendations || sections.health_assessment.selfCare || []).map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>

            {sections.health_assessment.seekCareIf && sections.health_assessment.seekCareIf.length > 0 && (
              <div className="warning-box">
                <strong>Seek immediate medical care if you experience:</strong>
                <ul className="warning-list">
                  {sections.health_assessment.seekCareIf.map((item, idx) => (
                    <li key={idx}>⚠️ {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hospital Finder Section */}
      {sections.hospital_finder && sections.hospital_finder.hospitals && sections.hospital_finder.hospitals.length > 0 && (
        <div className="action-section">
          {renderSectionHeader('Nearby Healthcare Facilities', '🏥', 'hospital', 'medium')}
          <div className={`action-section-content ${activeSection === 'hospital' ? 'show' : ''}`}>
            <p className="section-tip">{sections.hospital_finder.tip}</p>
            <div className="hospitals-grid">
              {sections.hospital_finder.hospitals.map((h, idx) => (
                <div key={idx} className="hospital-card glass-card">
                  <div className="hospital-card-header">
                    <h5>{h.name}</h5>
                    <span className={`hospital-type-badge ${h.type?.toLowerCase()}`}>{h.type}</span>
                  </div>
                  <div className="hospital-details">
                    <p>📍 {h.address}</p>
                    <p>📞 Phone: {h.phone || h.contact || 'N/A'}</p>
                    <p>⭐ Rating: {h.rating} / 5 | 🛏️ Beds: {h.beds || 'N/A'}</p>
                    {h.emergency && <span className="em-tag">🚑 Emergency 24/7</span>}
                    {h.ayushmanBharat && <span className="ab-tag">📋 Ayushman Bharat</span>}
                  </div>
                  <div className="specialties-container">
                    {(h.specialties || []).slice(0, 3).map((s, sIdx) => (
                      <span key={sIdx} className="specialty-tag">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Government Health Schemes Section */}
      {sections.government_scheme && (
        <div className="action-section">
          {renderSectionHeader('Government Health Benefits', '📋', 'scheme', 'info')}
          <div className={`action-section-content ${activeSection === 'scheme' ? 'show' : ''}`}>
            <p className="section-tip">{sections.government_scheme.tip}</p>
            <div className="schemes-list">
              {(sections.government_scheme.schemes || []).map((s, idx) => (
                <div key={idx} className="scheme-card glass-card">
                  <div className="scheme-card-header">
                    <h5>{s.name} {s.shortName ? `(${s.shortName})` : ''}</h5>
                    <span className="coverage-badge">{s.coverage || s.coverageAmount}</span>
                  </div>
                  <p className="scheme-desc">{s.description}</p>
                  <div className="scheme-details">
                    <div>🎯 <strong>Eligibility:</strong> {s.eligibility?.incomeLimit || s.eligibility || 'Check website'}</div>
                    {s.documentsRequired && (
                      <div className="docs-needed">
                        📄 <strong>Required Documents:</strong>
                        <div className="doc-badges">
                          {s.documentsRequired.map((doc, docIdx) => (
                            <span key={docIdx} className="doc-badge">{doc}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {s.website && (
                    <a href={s.website} target="_blank" rel="noopener noreferrer" className="apply-btn">
                      🔗 Apply Now
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Medicine Information Section */}
      {sections.medicine_info && (
        <div className="action-section">
          {renderSectionHeader('Medicine Reference & Education', '💊', 'medicine', 'low')}
          <div className={`action-section-content ${activeSection === 'medicine' ? 'show' : ''}`}>
            <p className="disclaimer-text">{sections.medicine_info.disclaimer}</p>
            <div className="medicines-grid">
              {(sections.medicine_info.medicines || sections.medicine_info.relevantMedicines || []).map((m, idx) => (
                <div key={idx} className="medicine-card glass-card">
                  <h5>{m.name || m.genericName}</h5>
                  <p><strong>🩺 Usage:</strong> {m.usage}</p>
                  <p><strong>🥄 Dosage:</strong> {m.dosage || m.dosageInfo}</p>
                  <p><strong>⚠️ Warning:</strong> {m.warning || (m.precautions && m.precautions[0])}</p>
                </div>
              ))}
            </div>
            {sections.medicine_info.generalAdvice && (
              <div className="general-med-advice">
                <h5>💡 General Medicine Guidelines</h5>
                <ul>
                  {sections.medicine_info.generalAdvice.map((adv, idx) => (
                    <li key={idx}>{adv}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Follow-up Section */}
      {sections.followup && (
        <div className="action-section">
          {renderSectionHeader('Follow-up Care & Timelines', '📅', 'followup', 'low')}
          <div className={`action-section-content ${activeSection === 'followup' || !compact ? 'show' : ''}`}>
            <h4 className="sub-title">Health Reminders Timeline:</h4>
            <div className="timeline">
              {(sections.followup.reminders || []).map((r, idx) => (
                <div key={idx} className={`timeline-item ${r.priority || 'medium'}`}>
                  <div className="timeline-badge"></div>
                  <div className="timeline-content">
                    <span className="time-tag">{r.when || r.timing}</span>
                    <p className="rem-message">{r.action || r.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {sections.followup.monitoring && sections.followup.monitoring.length > 0 && (
              <div className="monitoring-box">
                <h5>📈 Health Monitoring Checklist</h5>
                <ul>
                  {sections.followup.monitoring.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="action-plan-footer">
        <button className="btn btn-secondary" onClick={() => window.print()}>
          🖨️ Print Action Plan
        </button>
        <button className="btn btn-ghost" onClick={() => alert('Action plan saved to your Health Profile')}>
          💾 Save to Profile
        </button>
      </div>
    </div>
  );
}
