import React from 'react';
import Dashboard from '../components/Dashboard/Dashboard';

export default function DashboardPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', background: 'var(--bg-primary)' }}>
      <Dashboard />
    </div>
  );
}
