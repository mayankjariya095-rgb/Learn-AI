import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Download,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import CategoryBadge from '../components/CategoryBadge';

export default function PredictionHistory() {
  const [predictions, setPredictions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [studentId, setStudentId] = useState('');
  const [category, setCategory] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPredictionHistory({
        page,
        page_size: 10,
        student_id: studentId,
        category,
      });
      setPredictions(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch prediction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, category]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchHistory();
    }, 350);
    return () => clearTimeout(timer);
  }, [studentId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this historical prediction record?')) return;
    try {
      await api.deletePrediction(id);
      fetchHistory();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const totalPages = Math.ceil(totalCount / 10) || 1;

  const handleExportCSV = () => {
    const url = api.getPredictionExportCSVUrl({ student_id: studentId, category });
    window.open(url, '_blank');
  };

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Model Prediction Audit Log</h1>
          <p className="section-desc">
            Complete historical audit trail of all machine learning inference runs, features, and outcome classifications.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
          <Link to="/predict" className="btn btn-primary">
            <Sparkles size={16} /> New Prediction
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel filter-bar">
        <div className="filter-group">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="form-control search-input"
              placeholder="Filter by Student ID..."
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="">All Categories</option>
            <option value="At Risk">At Risk</option>
            <option value="Needs Improvement">Needs Improvement</option>
            <option value="Satisfactory">Satisfactory</option>
            <option value="Good">Good</option>
            <option value="Excellent">Excellent</option>
          </select>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={fetchHistory} title="Refresh">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Table Container */}
      <div className="table-container">
        {loading ? (
          <div className="empty-state">
            <RefreshCw size={28} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
            <p>Loading historical records...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <AlertCircle size={32} color="#f43f5e" />
            <p style={{ color: 'var(--accent-rose)' }}>{error}</p>
            <button className="btn btn-secondary btn-sm" onClick={fetchHistory}>
              Retry
            </button>
          </div>
        ) : predictions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <History size={28} />
            </div>
            <h3>No predictions recorded yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Execute your first prediction in the predictor tool to log an audit entry.
            </p>
            <Link to="/predict" className="btn btn-primary btn-sm">
              <Sparkles size={14} /> Run Prediction
            </Link>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Student</th>
                <th>Features (Study | Att | Asgn | Prev)</th>
                <th>Predicted Marks</th>
                <th>Category</th>
                <th>Actual Final</th>
                <th>Model</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(p.created_at).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {p.student_name_snapshot || 'Exploratory Run'}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>
                      {p.student_id_snapshot || 'What-If Input'}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.825rem' }}>
                    <span>{p.study_hours}h</span> •{' '}
                    <span>{p.attendance_percentage}%</span> •{' '}
                    <span>{p.assignment_score}%</span> •{' '}
                    <span>{p.previous_exam_marks}%</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8' }}>
                      {p.predicted_marks}%
                    </span>
                  </td>
                  <td>
                    <CategoryBadge category={p.performance_category} />
                  </td>
                  <td>
                    {p.actual_marks !== null && p.actual_marks !== undefined ? (
                      <span style={{ fontWeight: 600 }}>
                        {p.actual_marks}%{' '}
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: Math.abs(p.variance) <= 5 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                          }}
                        >
                          ({p.variance > 0 ? `+${p.variance}` : p.variance}%)
                        </span>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Pending</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {p.model_version || 'v1.0'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-danger btn-sm"
                      title="Delete Entry"
                      onClick={() => handleDelete(p.id)}
                      style={{ padding: '4px 8px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Bar */}
        {!loading && totalCount > 0 && (
          <div className="pagination-bar">
            <span>
              Showing {predictions.length > 0 ? (page - 1) * 10 + 1 : 0} to{' '}
              {Math.min(page * 10, totalCount)} of {totalCount} audits
            </span>
            <div className="pagination-controls">
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span style={{ padding: '4px 10px', fontSize: '0.85rem' }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
