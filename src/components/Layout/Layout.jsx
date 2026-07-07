import React from 'react';
import Header from './Header';
import './Layout.css';

export default function Layout({ children }) {
  return (
    <div className="layout">
      {/* Animated background orbs */}
      <div className="layout__bg" aria-hidden="true">
        <div className="layout__orb layout__orb--1" />
        <div className="layout__orb layout__orb--2" />
        <div className="layout__orb layout__orb--3" />
      </div>

      <Header />

      <main className="layout__main">
        {children}
      </main>
    </div>
  );
}
