import React from 'react';
import Header from './Header';
import { useApp } from '../../context/AppContext';
import './Layout.css';

export default function Layout({ children }) {
  const { themeContext } = useApp();

  return (
    <div className={`ll-layout layout--context-${themeContext || 'neutral'}`}>
      <Header />
      <main className="ll-layout__main">
        {children}
      </main>
    </div>
  );
}
