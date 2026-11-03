import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  UserPlus,
  Save,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Calendar,
  Clock,
  Award
} from 'lucide-react';
import { api } from '../services/api';

const COURSES = [
  'Computer Science & Engineering',
  'Data Science & AI',
  'Information Technology',
  'Electrical Engineering',
  'Electronics & Communication'
];

export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    course: 'Computer Science',
    study_hours_per_day: '4.0',
    attendance_percentage: '80.0',
    assignment_score: '75.0',
    previous_exam_marks: '72.0',
    final_exam_marks: '',
  });

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [createdStudentId, setCreatedStudentId] = useState(null);

  useEffect(() => {
    if (isEdit) {
      const fetchStudent = async () => {
        try {
          const s = await api.getStudent(id);
          setFormData({
            student_id: s.student_id,
            name: s.name,
            course: s.course,
            study_hours_per_day: String(s.study_hours_per_day),
            attendance_percentage: String(s.attendance_percentage),
            assignment_score: String(s.assignment_score),
            previous_exam_marks: String(s.previous_exam_marks),
            final_exam_marks: s.final_exam_marks !== null ? String(s.final_exam_marks) : '',
          });
        } catch (err) {
          setServerError(err.message || 'Failed to load student details');
        } finally {
          setLoading(false);
        }
      };
      fetchStudent();
    }
  }, [id, isEdit]);

  const validate = () => {
    const errs = {};
    if (!formData.student_id.trim()) errs.student_id = 'Student ID is required.';
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.course) errs.course = 'Department/Course is required.';

    const hours = parseFloat(formData.study_hours_per_day);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      errs.study_hours_per_day = 'Study hours must be between 0 and 24.';
    }

    const attendance = parseFloat(formData.attendance_percentage);
    if (isNaN(attendance) || attendance < 0 || attendance > 100) {
      errs.attendance_percentage = 'Attendance must be between 0 and 100%.';
    }

    const assignment = parseFloat(formData.assignment_score);
    if (isNaN(assignment) || assignment < 0 || assignment > 100) {
      errs.assignment_score = 'Assignment score must be between 0 and 100%.';
    }

    const prevMarks = parseFloat(formData.previous_exam_marks);
    if (isNaN(prevMarks) || prevMarks < 0 || prevMarks > 100) {
      errs.previous_exam_marks = 'Previous exam marks must be between 0 and 100%.';
    }

    if (formData.final_exam_marks.trim() !== '') {
      const finalMarks = parseFloat(formData.final_exam_marks);
      if (isNaN(finalMarks) || finalMarks < 0 || finalMarks > 100) {
        errs.final_exam_marks = 'Final exam marks must be between 0 and 100% if provided.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError(null);
    setSuccessMsg(null);

    const payload = {
      student_id: formData.student_id.trim().toUpperCase(),
      name: formData.name.trim(),
      course: formData.course,
      study_hours_per_day: parseFloat(formData.study_hours_per_day),
      attendance_percentage: parseFloat(formData.attendance_percentage),
      assignment_score: parseFloat(formData.assignment_score),
      previous_exam_marks: parseFloat(formData.previous_exam_marks),
      final_exam_marks: formData.final_exam_marks.trim() !== '' ? parseFloat(formData.final_exam_marks) : null,
    };

    try {
      if (isEdit) {
        await api.updateStudent(id, payload);
        setSuccessMsg('Student profile updated successfully!');
        setTimeout(() => navigate('/students'), 1200);
      } else {
        const res = await api.createStudent(payload);
        setCreatedStudentId(res.student_id);
        setSuccessMsg(`Student profile for ${res.name} created successfully!`);
      }
    } catch (err) {
      setServerError(err.message || 'Failed to save student profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="empty-state">
        <p>Loading student profile...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/students" className="btn btn-secondary btn-sm" style={{ marginBottom: '14px' }}>
          <ArrowLeft size={14} /> Back to Student List
        </Link>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          {isEdit ? 'Edit Student Academic Profile' : 'Register New Student Profile'}
        </h1>
        <p className="section-desc">
          Capture student academic indicators used for real-time machine learning outcome forecasting.
        </p>
      </div>

      {serverError && (
        <div
          className="glass-panel"
          style={{
            padding: '16px 20px',
            marginBottom: '20px',
            borderColor: 'rgba(244, 63, 94, 0.4)',
            background: 'rgba(244, 63, 94, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertCircle size={20} color="#f43f5e" />
          <span style={{ color: '#fca5a5', fontSize: '0.9rem' }}>{serverError}</span>
        </div>
      )}

      {successMsg && (
        <div
          className="glass-panel"
          style={{
            padding: '16px 20px',
            marginBottom: '20px',
            borderColor: 'rgba(16, 185, 129, 0.4)',
            background: 'rgba(16, 185, 129, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span style={{ color: '#86efac', fontWeight: 600, fontSize: '0.925rem' }}>{successMsg}</span>
          </div>

          {!isEdit && createdStudentId && (
            <Link
              to={`/predict?student_id=${createdStudentId}`}
              className="btn btn-primary btn-sm"
              style={{ background: 'var(--accent-emerald)' }}
            >
              <Sparkles size={14} /> Run Prediction Now
            </Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Student ID */}
          <div className="form-group">
            <label className="form-label">Student ID / Roll No *</label>
            <input
              type="text"
              name="student_id"
              className="form-control"
              placeholder="e.g. CS2026-001"
              value={formData.student_id}
              onChange={handleChange}
              disabled={isEdit}
              style={{ textTransform: 'uppercase' }}
            />
            {errors.student_id && <span className="form-error">{errors.student_id}</span>}
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="e.g. Aarav Sharma"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* Department / Course */}
          <div className="form-group">
            <label className="form-label">Department / Course *</label>
            <select
              name="course"
              className="form-control"
              value={formData.course}
              onChange={handleChange}
            >
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.course && <span className="form-error">{errors.course}</span>}
          </div>

          {/* Daily Study Hours */}
          <div className="form-group">
            <label className="form-label">Study Hours Per Day (0 - 24) *</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              name="study_hours_per_day"
              className="form-control"
              value={formData.study_hours_per_day}
              onChange={handleChange}
            />
            {errors.study_hours_per_day && (
              <span className="form-error">{errors.study_hours_per_day}</span>
            )}
          </div>

          {/* Attendance % */}
          <div className="form-group">
            <label className="form-label">Attendance Percentage (0 - 100) *</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="100"
              name="attendance_percentage"
              className="form-control"
              value={formData.attendance_percentage}
              onChange={handleChange}
            />
            {errors.attendance_percentage && (
              <span className="form-error">{errors.attendance_percentage}</span>
            )}
          </div>

          {/* Assignment Score % */}
          <div className="form-group">
            <label className="form-label">Assignment Score (0 - 100) *</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="100"
              name="assignment_score"
              className="form-control"
              value={formData.assignment_score}
              onChange={handleChange}
            />
            {errors.assignment_score && (
              <span className="form-error">{errors.assignment_score}</span>
            )}
          </div>

          {/* Previous Exam Marks */}
          <div className="form-group">
            <label className="form-label">Previous Exam Marks (0 - 100) *</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="100"
              name="previous_exam_marks"
              className="form-control"
              value={formData.previous_exam_marks}
              onChange={handleChange}
            />
            {errors.previous_exam_marks && (
              <span className="form-error">{errors.previous_exam_marks}</span>
            )}
          </div>

          {/* Final Exam Marks */}
          <div className="form-group">
            <label className="form-label">
              Actual Final Exam Marks (Optional)
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '6px' }}>
                Leave blank if pending
              </span>
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="100"
              name="final_exam_marks"
              className="form-control"
              placeholder="e.g. 78.5 (or leave empty)"
              value={formData.final_exam_marks}
              onChange={handleChange}
            />
            {errors.final_exam_marks && (
              <span className="form-error">{errors.final_exam_marks}</span>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/students')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            <Save size={16} />
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Register Student'}
          </button>
        </div>
      </form>
    </div>
  );
}
