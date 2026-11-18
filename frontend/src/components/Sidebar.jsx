import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  TrendingUp,
  History,
  BarChart3,
  ArrowUpDown,
  Cpu,
  Info,
  GraduationCap,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/students', label: 'Students List', icon: Users },
    { to: '/students/new', label: 'Register Student', icon: UserPlus },
    { to: '/predict', label: 'Predict Outcome', icon: TrendingUp },
    { to: '/history', label: 'Prediction History', icon: History },
    { to: '/analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { to: '/data-transfer', label: 'CSV Import / Export', icon: ArrowUpDown },
    { to: '/model', label: 'ML Model & Metrics', icon: Cpu },
    { to: '/about', label: 'About Project', icon: Info },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">
          <GraduationCap size={22} color="#ffffff" />
        </div>
        <div className="brand-text">
          <h2>LearnAI</h2>
          <span className="brand-subtitle">Academic Intelligence</span>
        </div>
        {onClose && (
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="sidebar-tag">
        Dept. of Computer Science & Engineering
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (onClose) onClose();
              }}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
            Academic Intelligence Portal
          </span>
          <span className="db-info">Medi-Caps University • CSE</span>
        </div>
      </div>
    </aside>
  );
}
