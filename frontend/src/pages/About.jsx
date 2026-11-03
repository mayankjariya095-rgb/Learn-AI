import React from 'react';
import {
  GraduationCap,
  Layers,
  Cpu,
  Database,
  Code2,
  CheckCircle,
  Sparkles,
  BookOpen,
  ShieldCheck,
  FileText
} from 'lucide-react';

export default function About() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-good">Academic Minor Project</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>• Computer Science & Engineering</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>About LearnAI Project</h1>
          <p className="section-desc">
            An intelligent academic outcome forecasting and early intervention decision support system.
          </p>
        </div>
      </div>

      {/* Project Abstract */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={20} color="var(--primary)" /> Project Abstract & Motivation
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: '1.7', marginBottom: '14px' }}>
          Traditional academic assessments identify struggling students only after midterm or end-of-semester examinations,
          often leaving inadequate time for remedial counseling. <strong>LearnAI</strong> leverages predictive machine learning
          techniques to synthesize day-to-day engagement indicators (daily study hours, class attendance percentages, assignment
          submissions, and historical exam marks) into accurate continuous grade predictions and categorized performance classifications.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: '1.7' }}>
          The objective is to empower university faculty and academic mentors with an automated early warning system that
          proactively flags vulnerable students before final evaluations, prescribing concrete intervention steps to improve
          institutional retention and overall student success rates.
        </p>
      </div>

      {/* Architecture Workflow Cards */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={20} color="var(--accent-cyan)" /> System Workflow & Data Pipeline
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '18px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>01</div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>Student Ingestion</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Individual student registration with client/server validation, or bulk CSV upload with duplicate rejection.
            </p>
          </div>

          <div style={{ padding: '18px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '8px' }}>02</div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>ML Regression Inference</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Scikit-Learn linear regression pipeline computes expected final exam marks from behavioral features.
            </p>
          </div>

          <div style={{ padding: '18px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: '8px' }}>03</div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>Risk & Interventions</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Rule-based heuristic engine flags low attendance (&lt;75%) and study deficits, generating pedagogical guidance.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code2 size={20} color="var(--accent-emerald)" /> Full-Stack Technology Architecture
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: 'var(--primary)', fontSize: '0.95rem', marginBottom: '8px' }}>Backend & Database</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>• Python 3.14 & Django 5.0 REST Framework</li>
              <li>• SQLite relational database engine</li>
              <li>• Modular apps: students, predictions, analytics, ml</li>
              <li>• Robust pagination, filtering, search, and CSV import/export</li>
            </ul>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: 'var(--accent-cyan)', fontSize: '0.95rem', marginBottom: '8px' }}>Machine Learning</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>• Scikit-Learn 1.4+ (Linear Regression & Random Forest)</li>
              <li>• Joblib serialized pipeline model artifacts</li>
              <li>• R² Score: 0.9557, MAE: 2.671 marks</li>
              <li>• Live retraining and model versioning audit</li>
            </ul>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: 'var(--accent-emerald)', fontSize: '0.95rem', marginBottom: '8px' }}>Frontend & UI</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>• React 18 & Vite high-speed dev runtime</li>
              <li>• React Router v6 client-side routing</li>
              <li>• Recharts interactive data visualization</li>
              <li>• Vanilla CSS dark-mode glassmorphic design system</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
