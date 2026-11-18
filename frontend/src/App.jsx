import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import StudentsList from './pages/StudentsList';
import StudentForm from './pages/StudentForm';
import PredictOutcome from './pages/PredictOutcome';
import PredictionHistory from './pages/PredictionHistory';
import Analytics from './pages/Analytics';
import DataTransfer from './pages/DataTransfer';
import ModelMetrics from './pages/ModelMetrics';
import About from './pages/About';
import { api } from './services/api';
import { TrendingUp, UserPlus, Menu, X } from 'lucide-react';
import './App.css';

function Header({ onToggleMenu, isMenuOpen }) {
  const location = useLocation();

  const getPageTitle = (path) => {
    if (path === '/') return 'Executive Dashboard';
    if (path === '/students') return 'Student Directory';
    if (path === '/students/new') return 'New Student Registration';
    if (path.includes('/students/') && path.includes('/edit')) return 'Update Student Profile';
    if (path === '/predict') return 'ML Outcome Predictor';
    if (path === '/history') return 'Prediction Audit Logs';
    if (path === '/analytics') return 'Performance Analytics';
    if (path === '/data-transfer') return 'Data Import / Export';
    if (path === '/model') return 'ML Pipeline Metrics';
    if (path === '/about') return 'About LearnAI Project';
    return 'LearnAI Platform';
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={onToggleMenu}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="header-title-group">
          <h2 className="header-page-title">{getPageTitle(location.pathname)}</h2>
          <span className="header-badge">Session 2026-27 | BCA</span>
        </div>
      </div>

      <div className="header-actions">
        <Link to="/students/new" className="btn btn-secondary btn-sm header-action-btn">
          <UserPlus size={14} /> <span>Register</span>
        </Link>
        <Link to="/predict" className="btn btn-primary btn-sm header-action-btn">
          <TrendingUp size={14} /> <span>Predict</span>
        </Link>
      </div>
    </header>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-container">
        {sidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="main-layout">
          <Header
            onToggleMenu={() => setSidebarOpen(!sidebarOpen)}
            isMenuOpen={sidebarOpen}
          />
          <main className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<StudentsList />} />
              <Route path="/students/new" element={<StudentForm />} />
              <Route path="/students/:id/edit" element={<StudentForm />} />
              <Route path="/predict" element={<PredictOutcome />} />
              <Route path="/history" element={<PredictionHistory />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/data-transfer" element={<DataTransfer />} />
              <Route path="/model" element={<ModelMetrics />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
