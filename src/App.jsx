import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import SchemesPage from './pages/SchemesPage';
import AuthPage from './pages/AuthPage';
import MedicalHistoryPage from './pages/MedicalHistoryPage';
import { useApp } from './context/AppContext';

export default function App() {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/schemes" element={<SchemesPage />} />
        <Route path="/history" element={<MedicalHistoryPage />} />
      </Routes>
    </Layout>
  );
}
