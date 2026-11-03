import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  Award,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  GraduationCap
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { api } from '../services/api';
import CategoryBadge from '../components/CategoryBadge';

const CATEGORY_COLORS = {
  'At Risk': '#f43f5e',
  'Needs Improvement': '#f59e0b',
  'Satisfactory': '#0ea5e9',
  'Good': '#8b5cf6',
  'Excellent': '#10b981',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');

  const fetchDashboard = async (course = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardStats(course ? { course } : {});
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(selectedCourse);
  }, [selectedCourse]);

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  if (loading && !data) {
    return (
      <div className="empty-state">
        <RefreshCw size={32} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
        <p>Analyzing learning outcome records...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
        <AlertTriangle size={42} color="#f43f5e" style={{ margin: '0 auto 12px' }} />
        <h3>Unable to Connect to Backend</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{error}</p>
        <button className="btn btn-primary" onClick={() => fetchDashboard(selectedCourse)}>
          <RefreshCw size={16} /> Retry Connection
        </button>
      </div>
    );
  }

  const chartData = data?.category_distribution || [];
  const courseData = data?.course_summary || [];

  return (
    <div className="animate-fade-in">
      {/* Top Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-good">Academic Minor Project</span>
            <span style={{ fontSize: '0.785rem', color: 'var(--text-dim)' }}>• Evaluation Ready</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Student Learning Outcome Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Real-time machine learning inference for early intervention and academic performance forecasting.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            className="form-control"
            value={selectedCourse}
            onChange={handleCourseChange}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="">All Departments</option>
            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
            <option value="Data Science & AI">Data Science & AI</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Electronics & Communication">Electronics & Communication</option>
          </select>

          <Link to="/predict" className="btn btn-primary">
            <Sparkles size={16} /> Predict Outcome
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{data?.total_students || 0}</span>
            <span className="stat-subtext">Active student records</span>
          </div>
          <div className="stat-icon-box icon-purple">
            <Users size={22} />
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">At-Risk Students</span>
            <span className="stat-value" style={{ color: 'var(--accent-rose)' }}>
              {data?.at_risk_students_count || 0}
            </span>
            <span className="stat-subtext">Need academic intervention</span>
          </div>
          <div className="stat-icon-box icon-rose">
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">Avg Predicted Score</span>
            <span className="stat-value" style={{ color: 'var(--accent-cyan)' }}>
              {data?.avg_predicted_marks !== null ? `${data.avg_predicted_marks}%` : 'N/A'}
            </span>
            <span className="stat-subtext">Across {data?.total_predictions || 0} ML inferences</span>
          </div>
          <div className="stat-icon-box icon-cyan">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">Avg Attendance</span>
            <span className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
              {data?.avg_attendance !== null ? `${data.avg_attendance}%` : 'N/A'}
            </span>
            <span className="stat-subtext">Avg Daily Study: {data?.avg_study_hours || 0} hrs</span>
          </div>
          <div className="stat-icon-box icon-emerald">
            <CalendarCheck size={22} />
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">Evaluated Marks</span>
            <span className="stat-value" style={{ color: 'var(--accent-amber)' }}>
              {data?.avg_actual_marks !== null ? `${data.avg_actual_marks}%` : 'Pending'}
            </span>
            <span className="stat-subtext">{data?.evaluated_students_count || 0} students evaluated</span>
          </div>
          <div className="stat-icon-box icon-amber">
            <Award size={22} />
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid-2">
        {/* Performance Category Distribution */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div className="section-header">
            <div>
              <h3 className="section-title">ML Performance Distribution</h3>
              <p className="section-desc">Classified outcome categories across predictions</p>
            </div>
            <Link to="/analytics" className="btn btn-secondary btn-sm">
              Full Analytics <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.name] || '#6366f1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Performance Summary */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div className="section-header">
            <div>
              <h3 className="section-title">Department Breakdown</h3>
              <p className="section-desc">Average attendance and scores by branch</p>
            </div>
            <Link to="/students" className="btn btn-secondary btn-sm">
              View Students <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Students</th>
                  <th>Avg Attendance</th>
                  <th>Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {courseData.map((c) => (
                  <tr key={c.course}>
                    <td style={{ fontWeight: 600 }}>{c.course}</td>
                    <td>{c.student_count}</td>
                    <td>
                      <span
                        style={{
                          color: c.avg_attendance >= 75 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                          fontWeight: 600
                        }}
                      >
                        {c.avg_attendance}%
                      </span>
                    </td>
                    <td>{c.avg_previous_marks}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Activity: Students & Predictions */}
      <div className="grid-2">
        {/* Recent Students */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div className="section-header">
            <div>
              <h3 className="section-title">Recently Registered Students</h3>
              <p className="section-desc">Latest student academic profiles</p>
            </div>
            <Link to="/students/new" className="btn btn-secondary btn-sm">
              + Register
            </Link>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recent_students || []).map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{s.student_id}</td>
                    <td>{s.name}</td>
                    <td>{s.course}</td>
                    <td>
                      <span
                        style={{
                          color: s.attendance >= 75 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                          fontWeight: 600,
                        }}
                      >
                        {s.attendance}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Predictions */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div className="section-header">
            <div>
              <h3 className="section-title">Latest ML Inferences</h3>
              <p className="section-desc">Most recent model evaluations</p>
            </div>
            <Link to="/history" className="btn btn-secondary btn-sm">
              Full History <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Predicted Marks</th>
                  <th>Outcome Category</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recent_predictions || []).map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.student_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                        {p.student_id}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8' }}>
                        {p.predicted_marks}%
                      </span>
                    </td>
                    <td>
                      <CategoryBadge category={p.category} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
