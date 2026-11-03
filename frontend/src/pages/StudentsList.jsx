import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Download,
  Trash2,
  Edit,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import CategoryBadge from '../components/CategoryBadge';

export default function StudentsList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('');
  const [category, setCategory] = useState('');
  const [ordering, setOrdering] = useState('-created_at');

  // Delete modal state
  const [deleteModalStudent, setDeleteModalStudent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getStudents({
        page,
        page_size: 10,
        search,
        course,
        category,
        ordering,
      });
      setStudents(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, course, category, ordering]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchStudents();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async () => {
    if (!deleteModalStudent) return;
    setDeleting(true);
    try {
      await api.deleteStudent(deleteModalStudent.id);
      setDeleteModalStudent(null);
      fetchStudents();
    } catch (err) {
      alert(`Failed to delete student: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / 10) || 1;

  const handleExportCSV = () => {
    const exportUrl = api.getStudentExportCSVUrl({ search, course });
    window.open(exportUrl, '_blank');
  };

  return (
    <div className="animate-fade-in">
      {/* Header Bar */}
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Student Academic Records</h1>
          <p className="section-desc">
            Manage profiles, monitor attendance thresholds, and inspect historical grades.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
          <Link to="/students/new" className="btn btn-primary">
            <Plus size={16} /> Register Student
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
              placeholder="Search by name or student ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            value={course}
            onChange={(e) => {
              setCourse(e.target.value);
              setPage(1);
            }}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="">All Departments</option>
            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
            <option value="Data Science & AI">Data Science & AI</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Electronics & Communication">Electronics & Communication</option>
          </select>

          <select
            className="form-control"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="">All Outcome Statuses</option>
            <option value="At Risk">At Risk (&lt;40)</option>
            <option value="Needs Improvement">Needs Improvement (40-60)</option>
            <option value="Satisfactory">Satisfactory (60-75)</option>
            <option value="Good">Good (75-90)</option>
            <option value="Excellent">Excellent (90+)</option>
            <option value="Not Evaluated">Pending Evaluation</option>
          </select>

          <select
            className="form-control"
            value={ordering}
            onChange={(e) => {
              setOrdering(e.target.value);
              setPage(1);
            }}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="-created_at">Sort: Newest First</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="-attendance_percentage">Sort: Highest Attendance</option>
            <option value="attendance_percentage">Sort: Lowest Attendance</option>
            <option value="-previous_exam_marks">Sort: Highest Prev Marks</option>
          </select>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={fetchStudents} title="Refresh">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Table Container */}
      <div className="table-container">
        {loading ? (
          <div className="empty-state">
            <RefreshCw size={28} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
            <p>Loading records...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <AlertCircle size={32} color="#f43f5e" />
            <p style={{ color: 'var(--accent-rose)' }}>{error}</p>
            <button className="btn btn-secondary btn-sm" onClick={fetchStudents}>
              Retry
            </button>
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Users size={28} />
            </div>
            <h3>No student records found</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Try adjusting your search criteria or register a new student.
            </p>
            <Link to="/students/new" className="btn btn-primary btn-sm">
              <Plus size={14} /> Register New Student
            </Link>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Daily Study</th>
                <th>Attendance</th>
                <th>Assignments</th>
                <th>Previous Exam</th>
                <th>Final Exam</th>
                <th>Outcome Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const isAttendanceLow = student.attendance_percentage < 75;
                return (
                  <tr key={student.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                      {student.student_id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{student.name}</div>
                    </td>
                    <td>{student.course}</td>
                    <td>{student.study_hours_per_day} hrs</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: isAttendanceLow ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                          background: isAttendanceLow ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}
                      >
                        {student.attendance_percentage}%
                      </span>
                    </td>
                    <td>{student.assignment_score}%</td>
                    <td>{student.previous_exam_marks}%</td>
                    <td>
                      {student.final_exam_marks !== null ? (
                        <span style={{ fontWeight: 700 }}>{student.final_exam_marks}%</span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Pending</span>
                      )}
                    </td>
                    <td>
                      <CategoryBadge category={student.actual_category} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          title="Run ML Prediction for this student"
                          onClick={() => navigate(`/predict?student_id=${student.student_id}`)}
                          style={{ padding: '4px 8px' }}
                        >
                          <Sparkles size={13} /> Predict
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Edit Profile"
                          onClick={() => navigate(`/students/${student.id}/edit`)}
                          style={{ padding: '4px 8px' }}
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          title="Delete Record"
                          onClick={() => setDeleteModalStudent(student)}
                          style={{ padding: '4px 8px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination Bar */}
        {!loading && totalCount > 0 && (
          <div className="pagination-bar">
            <span>
              Showing {students.length > 0 ? (page - 1) * 10 + 1 : 0} to{' '}
              {Math.min(page * 10, totalCount)} of {totalCount} records
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

      {/* Delete Confirmation Modal */}
      {deleteModalStudent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              border: '1px solid rgba(244, 63, 94, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-rose)',
                }}
              >
                <Trash2 size={20} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Confirm Deletion</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Are you sure you want to delete student{' '}
              <strong style={{ color: '#ffffff' }}>{deleteModalStudent.name}</strong> (
              <span style={{ fontFamily: 'monospace' }}>{deleteModalStudent.student_id}</span>)? All associated
              learning outcome predictions will also be permanently deleted.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                disabled={deleting}
                onClick={() => setDeleteModalStudent(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
