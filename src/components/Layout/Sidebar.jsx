import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './Sidebar.css';

const CITIES = [
  'Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam',
  'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Siddipet',
  'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool',
  'Tirupati', 'Rajahmundry', 'Kakinada', 'Anantapur', 'Eluru',
  'Ongole', 'Kadapa', 'Srikakulam', 'Bhimavaram', 'Tenali',
];

export default function Sidebar({ isOpen, onClose }) {
  const { userProfile, updateProfile, agentStatuses, agents, isProcessing } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...userProfile });

  const activeCount = Object.values(agentStatuses).filter(s => s.status === 'processing').length;
  const completeCount = Object.values(agentStatuses).filter(s => s.status === 'complete').length;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const initials = userProfile.name
    ? userProfile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        {/* Profile Card */}
        <div className="sidebar__profile glass-card">
          <div className="sidebar__avatar">
            <span className="sidebar__avatar-text">{initials}</span>
          </div>
          <div className="sidebar__profile-info">
            <h4 className="sidebar__name">{userProfile.name || 'Set Your Profile'}</h4>
            <p className="sidebar__location">
              📍 {userProfile.location || 'Location not set'}
            </p>
          </div>
          <button className="btn btn-ghost btn-sm sidebar__edit-btn" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? '✕' : '✏️'}
          </button>
        </div>

        {/* Profile Form */}
        {isEditing && (
          <div className="sidebar__form glass-card animate-slideDown">
            <h5 className="sidebar__form-title">Quick Profile</h5>

            <div className="sidebar__field">
              <label>Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
              />
            </div>

            <div className="sidebar__field-row">
              <div className="sidebar__field">
                <label>Age</label>
                <input
                  type="number"
                  placeholder="Age"
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={e => handleChange('age', e.target.value)}
                />
              </div>
              <div className="sidebar__field">
                <label>Gender</label>
                <select value={formData.gender} onChange={e => handleChange('gender', e.target.value)}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="sidebar__field">
              <label>Location</label>
              <select value={formData.location} onChange={e => handleChange('location', e.target.value)}>
                <option value="">Select City</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="sidebar__field">
              <label>Existing Conditions</label>
              <input
                type="text"
                placeholder="e.g. Diabetes, Hypertension"
                value={formData.existingConditions}
                onChange={e => handleChange('existingConditions', e.target.value)}
              />
            </div>

            <button className="btn btn-primary btn-sm w-full" onClick={handleSave}>
              Save Profile
            </button>
          </div>
        )}

        {/* Agent Panel */}
        <div className="sidebar__agents">
          <div className="sidebar__agents-header">
            <h5 className="sidebar__agents-title">AI Agents</h5>
            <div className="sidebar__agents-badges">
              {activeCount > 0 && (
                <span className="badge badge--teal">{activeCount} active</span>
              )}
              {completeCount > 0 && (
                <span className="badge badge--green">{completeCount} done</span>
              )}
            </div>
          </div>

          <div className="sidebar__agents-list">
            {agents.map((agent, i) => {
              const status = agentStatuses[agent.id];
              return (
                <div
                  key={agent.id}
                  className={`sidebar__agent ${status?.status === 'processing' ? 'sidebar__agent--active' : ''} ${status?.status === 'complete' ? 'sidebar__agent--complete' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <span className="sidebar__agent-emoji">{agent.emoji}</span>
                  <span className="sidebar__agent-name">{agent.name.replace(' Agent', '')}</span>
                  <span className={`agent-status agent-status--${status?.status || 'idle'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="sidebar__footer">
          <p className="sidebar__footer-text">LifeLine AI v1.0</p>
          <p className="sidebar__footer-text">Made for Hackathon 🚀</p>
        </div>
      </aside>
    </>
  );
}
