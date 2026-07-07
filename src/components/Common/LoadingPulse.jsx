import React from 'react';
import './LoadingPulse.css';

export default function LoadingPulse({ text = 'Analyzing...', size = 'md' }) {
  return (
    <div className={`loading-pulse loading-pulse--${size}`}>
      <div className="loading-pulse__dots">
        <span className="loading-pulse__dot" />
        <span className="loading-pulse__dot" />
        <span className="loading-pulse__dot" />
      </div>
      {text && <p className="loading-pulse__text">{text}</p>}
    </div>
  );
}
