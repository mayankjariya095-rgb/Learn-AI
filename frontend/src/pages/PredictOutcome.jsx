import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  User,
  Sliders,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Cpu,
  History,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import CategoryBadge from '../components/CategoryBadge';

export default function PredictOutcome() {
  const [searchParams] = useSearchParams();
  const initialStudentId = searchParams.get('student_id') || '';

  // Mode: 'student' or 'custom'
  const [mode, setMode] = useState(initialStudentId ? 'student' : 'student');
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Inputs
  const [studyHours, setStudyHours] = useState(4.5);
  const [attendance, setAttendance] = useState(82.0);
  const [assignment, setAssignment] = useState(78.0);
  const [previousMarks, setPreviousMarks] = useState(70.0);
  const [saveRecord, setSaveRecord] = useState(true);

  // Status
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Load students for dropdown selection
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await api.getStudents({ all: 'true' });
        const list = res.results || [];
        setAllStudents(list);

        if (initialStudentId) {
          const match = list.find(
            (s) => s.student_id.toLowerCase() === initialStudentId.toLowerCase()
          );
          if (match) {
            handleSelectStudent(match);
          }
        } else if (list.length > 0) {
          handleSelectStudent(list[0]);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoadingStudents(false);
      }
    };
    loadStudents();
  }, [initialStudentId]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    if (student) {
      setStudyHours(student.study_hours_per_day);
      setAttendance(student.attendance_percentage);
      setAssignment(student.assignment_score);
      setPreviousMarks(student.previous_exam_marks);
    }
  };

  const handleRunPrediction = async (e) => {
    if (e) e.preventDefault();
    setPredicting(true);
    setError(null);

    const payload = {
      study_hours: parseFloat(studyHours),
      attendance: parseFloat(attendance),
      assignment: parseFloat(assignment),
      previous_marks: parseFloat(previousMarks),
      save_record: saveRecord,
    };

    if (mode === 'student' && selectedStudent) {
      payload.student_id = selectedStudent.student_id;
    }

    try {
      const data = await api.predictOutcome(payload);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to generate ML prediction');
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1040px', margin: '0 auto' }}>
      {/* Page Title */}
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-good">Machine Learning Core</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>• Scikit-Learn Inference</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Student Learning Outcome Prediction</h1>
          <p className="section-desc">
            Forecast final exam performance and identify early risk factors based on student behavioral metrics.
          </p>
        </div>

        <Link to="/history" className="btn btn-secondary btn-sm">
          <History size={15} /> View Audit History
        </Link>
      </div>

      {/* Mode Selector Tabs */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          padding: '6px',
          gap: '8px',
          marginBottom: '24px',
          background: 'rgba(15, 23, 42, 0.6)',
          width: 'fit-content',
        }}
      >
        <button
          type="button"
          className={`btn btn-sm ${mode === 'student' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('student')}
        >
          <User size={15} /> Evaluate Enrolled Student
        </button>
        <button
          type="button"
          className={`btn btn-sm ${mode === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setMode('custom');
            setSelectedStudent(null);
          }}
        >
          <Sliders size={15} /> Exploratory Simulation (What-If)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1.1fr 1fr' : '1fr', gap: '24px' }}>
        {/* Left Side: Input Panel */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={19} color="var(--primary)" />
            {mode === 'student' ? 'Student & Feature Parameters' : 'What-If Simulation Inputs'}
          </h3>

          {/* Student Selector if in student mode */}
          {mode === 'student' && (
            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label">Select Registered Student Profile</label>
              {loadingStudents ? (
                <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Loading student directory...</div>
              ) : (
                <select
                  className="form-control"
                  value={selectedStudent ? selectedStudent.id : ''}
                  onChange={(e) => {
                    const found = allStudents.find((s) => s.id === parseInt(e.target.value));
                    handleSelectStudent(found);
                  }}
                >
                  {allStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.student_id} - {s.name} ({s.course})
                    </option>
                  ))}
                </select>
              )}
              {selectedStudent && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Department: <strong>{selectedStudent.course}</strong></span>
                  <span>
                    Final Exam:{' '}
                    <strong>
                      {selectedStudent.final_exam_marks !== null
                        ? `${selectedStudent.final_exam_marks}%`
                        : 'Pending Evaluation'}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Feature 1: Study Hours */}
          <div className="slider-container">
            <div className="slider-header">
              <span className="slider-label">Daily Study Hours (0 - 16 hrs)</span>
              <span className="slider-val-badge">{studyHours} hrs/day</span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              step="0.5"
              className="range-slider"
              value={studyHours}
              onChange={(e) => setStudyHours(parseFloat(e.target.value))}
            />
          </div>

          {/* Feature 2: Attendance */}
          <div className="slider-container">
            <div className="slider-header">
              <span className="slider-label">Attendance Percentage (0 - 100%)</span>
              <span
                className="slider-val-badge"
                style={{
                  color: attendance < 75 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                  borderColor: attendance < 75 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                  background: attendance < 75 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                }}
              >
                {attendance}% {attendance < 75 ? '(! Below 75% min)' : ''}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              className="range-slider"
              value={attendance}
              onChange={(e) => setAttendance(parseFloat(e.target.value))}
            />
          </div>

          {/* Feature 3: Assignment Score */}
          <div className="slider-container">
            <div className="slider-header">
              <span className="slider-label">Assignment Score (0 - 100%)</span>
              <span className="slider-val-badge">{assignment}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              className="range-slider"
              value={assignment}
              onChange={(e) => setAssignment(parseFloat(e.target.value))}
            />
          </div>

          {/* Feature 4: Previous Exam Marks */}
          <div className="slider-container">
            <div className="slider-header">
              <span className="slider-label">Previous Exam Marks (0 - 100%)</span>
              <span className="slider-val-badge">{previousMarks}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              className="range-slider"
              value={previousMarks}
              onChange={(e) => setPreviousMarks(parseFloat(e.target.value))}
            />
          </div>

          {/* Save to History Checkbox */}
          <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="saveCheck"
              checked={saveRecord}
              onChange={(e) => setSaveRecord(e.target.checked)}
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="saveCheck" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Save prediction record to persistent audit database
            </label>
          </div>

          {error && (
            <div
              style={{
                padding: '12px',
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-sm)',
                color: '#fca5a5',
                fontSize: '0.85rem',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px' }}
            disabled={predicting}
            onClick={handleRunPrediction}
          >
            <Sparkles size={18} />
            {predicting ? 'Executing ML Inference Pipeline...' : 'Generate Learning Outcome Prediction'}
          </button>
        </div>

        {/* Right Side: Prediction Output Showcase */}
        {result && (
          <div className="animate-fade-in prediction-showcase">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-good" style={{ marginBottom: '8px' }}>
                  Model: {result.model_version || 'Random Forest Regressor'}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Inference Outcome</h3>
                {result.student_name && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                    Student: <strong>{result.student_name}</strong> ({result.student_id})
                  </p>
                )}
              </div>
              <CategoryBadge category={result.performance_category} />
            </div>

            {/* Score Big Display */}
            <div className="score-display-row" style={{ marginTop: '20px' }}>
              <div>
                <span className="stat-label">Predicted Final Exam Score</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span className="score-big">{result.predicted_marks}%</span>
                  <span className="score-denominator">/ 100</span>
                </div>
              </div>

              {result.actual_final_marks !== null && (
                <div
                  style={{
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    textAlign: 'right',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>
                    Actual Final Marks
                  </span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                    {result.actual_final_marks}%
                  </span>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: Math.abs(result.variance) <= 5 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                    }}
                  >
                    Variance: {result.variance > 0 ? `+${result.variance}` : result.variance}%
                  </span>
                </div>
              )}
            </div>

            {/* Risk Factors Box */}
            {result.risk_factors && result.risk_factors.length > 0 && (
              <div className="risk-box">
                <h4>
                  <AlertTriangle size={17} /> Identified Academic Risk Factors
                </h4>
                <ul className="bullet-list">
                  {result.risk_factors.map((risk, idx) => (
                    <li key={idx} className="bullet-item">
                      <span className="bullet-dot" style={{ backgroundColor: 'var(--accent-rose)' }}></span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations Box */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="rec-box">
                <h4>
                  <Lightbulb size={17} /> Recommended Interventions
                </h4>
                <ul className="bullet-list">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="bullet-item">
                      <span className="bullet-dot" style={{ backgroundColor: 'var(--accent-emerald)' }}></span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Feature Breakdown */}
            {result.feature_breakdown && (
              <div style={{ marginTop: '20px' }}>
                <span className="stat-label" style={{ marginBottom: '10px', display: 'block' }}>
                  Feature Performance & Benchmarks
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {Object.entries(result.feature_breakdown).map(([key, item]) => {
                    let label = key.replace(/_/g, ' ');
                    if (key === 'study_hours_per_day') label = 'Study Hours';
                    if (key === 'attendance_percentage') label = 'Attendance';
                    if (key === 'assignment_score') label = 'Assignments';
                    if (key === 'previous_exam_marks') label = 'Previous Marks';

                    const isObj = typeof item === 'object' && item !== null;
                    const statusText = isObj ? item.status : item;
                    const benchText = isObj ? `Target: ${item.benchmark}` : '';

                    return (
                      <div
                        key={key}
                        style={{
                          padding: '10px 12px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>
                            {label}
                          </span>
                          <span
                            style={{
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              color:
                                statusText === 'Critical Deficit' || statusText === 'Severe Deficit'
                                  ? 'var(--accent-rose)'
                                  : statusText === 'Needs Improvement' || statusText === 'Moderate'
                                  ? 'var(--accent-amber)'
                                  : 'var(--accent-emerald)',
                            }}
                          >
                            {statusText}
                          </span>
                        </div>
                        {benchText && (
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {benchText}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            {result.disclaimer && (
              <p
                style={{
                  fontSize: '0.725rem',
                  color: 'var(--text-dim)',
                  marginTop: '18px',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '10px',
                }}
              >
                * {result.disclaimer}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
