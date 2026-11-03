import React, { useState } from 'react';
import {
  ArrowUpDown,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  FileText,
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export default function DataTransfer() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImportResult(null);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a valid .csv file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    setImportResult(null);

    try {
      const res = await api.importStudentsCSV(file);
      setImportResult(res);
      setFile(null);
    } catch (err) {
      setError(err.message || 'Failed to upload CSV file.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadSample = () => {
    const csvContent =
      'student_id,name,course,study_hours_per_day,attendance_percentage,assignment_score,previous_exam_marks,final_exam_marks\n' +
      'CS2026-101,Rohan Mehta,Computer Science,4.5,84.0,76.5,72.0,75.0\n' +
      'IT2026-102,Priya Sharma,Information Technology,5.0,91.0,85.0,88.0,\n' +
      'DS2026-103,Amit Verma,Data Science,2.0,62.0,45.0,48.0,42.0\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_student_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-satisfactory">Batch Ingestion & Export</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>• CSV Interoperability</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Dataset Import & Export Hub</h1>
          <p className="section-desc">
            Bulk-load departmental student datasets into the SQLite database with automatic validation and error auditing.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={handleDownloadSample}>
          <Download size={14} /> Download Sample Template
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        {/* CSV Import Panel */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={20} color="var(--primary)" /> Batch Import Student CSV
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Accepts UTF-8 comma-separated files containing student profile columns.
          </p>

          <form onSubmit={handleUpload}>
            <div
              style={{
                border: '2px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '36px 20px',
                textAlign: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                marginBottom: '18px',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('csvFileInput').click()}
            >
              <FileSpreadsheet size={40} color="var(--accent-cyan)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>
                {file ? file.name : 'Click to browse or drop CSV file'}
              </p>
              <span style={{ fontSize: '0.785rem', color: 'var(--text-dim)' }}>
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Maximum file size 10MB'}
              </span>

              <input
                type="file"
                id="csvFileInput"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
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
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
              disabled={!file || uploading}
            >
              <Upload size={16} />
              {uploading ? 'Validating and Importing...' : 'Upload & Process Records'}
            </button>
          </form>

          {/* Import Results Box */}
          {importResult && (
            <div
              className="animate-fade-in"
              style={{
                marginTop: '22px',
                padding: '18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <CheckCircle size={20} color="var(--accent-emerald)" />
                <h4 style={{ color: 'var(--accent-emerald)', fontSize: '0.95rem' }}>Batch Import Complete</h4>
              </div>

              <div style={{ display: 'flex', gap: '18px', fontSize: '0.85rem', marginBottom: '12px' }}>
                <span>Total Rows: <strong>{importResult.total_rows}</strong></span>
                <span style={{ color: 'var(--accent-emerald)' }}>
                  Imported: <strong>{importResult.imported_count}</strong>
                </span>
                <span style={{ color: importResult.rejected_count > 0 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                  Rejected: <strong>{importResult.rejected_count}</strong>
                </span>
              </div>

              {importResult.rejected_rows && importResult.rejected_rows.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <span style={{ fontSize: '0.785rem', color: 'var(--accent-rose)', fontWeight: 600 }}>
                    Rejection Audit Log:
                  </span>
                  <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', paddingLeft: '18px' }}>
                    {importResult.rejected_rows.map((r, i) => (
                      <li key={i}>
                        Line {r.line} ({r.student_id}): {r.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CSV Export & System Datasets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Export Students */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={18} color="var(--accent-emerald)" /> Export Students Dataset
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Download all registered student profiles with evaluated grades and actual performance tiers.
            </p>
            <a
              href={api.getStudentExportCSVUrl()}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <FileSpreadsheet size={16} /> Download Students CSV
            </a>
          </div>

          {/* Export Predictions */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={18} color="var(--accent-cyan)" /> Export Prediction Audits
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Download historical inference predictions, model version snapshots, and predicted vs actual variance.
            </p>
            <a
              href={api.getPredictionExportCSVUrl()}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <FileSpreadsheet size={16} /> Download Predictions CSV
            </a>
          </div>

          {/* Format specifications note */}
          <div
            className="glass-panel"
            style={{
              padding: '18px',
              borderLeft: '4px solid var(--primary)',
              background: 'rgba(99, 102, 241, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Info size={16} color="var(--primary)" />
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Required Schema Columns</h4>
            </div>
            <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
              <code>student_id, name, course, study_hours_per_day, attendance_percentage, assignment_score, previous_exam_marks, final_exam_marks</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
