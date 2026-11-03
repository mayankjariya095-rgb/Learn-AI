/**
 * LearnAI API Service Layer
 * Centralized HTTP client communicating with Django REST Framework backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = options.headers || {};

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const error = new Error(
      (data && data.error) ||
      (data && typeof data === 'object' && Object.values(data).flat().join(' ')) ||
      `Request failed with status ${response.status}`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // System Health
  healthCheck: () => request('/api/health/'),

  // Students
  getStudents: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return request(`/api/students/?${query.toString()}`);
  },

  getStudent: (id) => request(`/api/students/${id}/`),

  createStudent: (payload) =>
    request('/api/students/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateStudent: (id, payload) =>
    request(`/api/students/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  patchStudent: (id, payload) =>
    request(`/api/students/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteStudent: (id) =>
    request(`/api/students/${id}/`, {
      method: 'DELETE',
    }),

  getStudentPredictions: (id) => request(`/api/students/${id}/predictions/`),

  // Prediction
  predictOutcome: (payload) =>
    request('/api/predictions/predict/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getPredictionHistory: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return request(`/api/predictions/history/?${query.toString()}`);
  },

  deletePrediction: (id) =>
    request(`/api/predictions/history/${id}/`, {
      method: 'DELETE',
    }),

  // Analytics & Dashboard
  getDashboardStats: (params = {}) => {
    const query = new URLSearchParams();
    if (params.course) query.append('course', params.course);
    return request(`/api/analytics/dashboard/?${query.toString()}`);
  },

  // Machine Learning
  getModelInfo: () => request('/api/ml/info/'),

  retrainModel: () =>
    request('/api/ml/retrain/', {
      method: 'POST',
    }),

  // CSV Data Transfer
  importStudentsCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/students/import-csv/', {
      method: 'POST',
      body: formData,
    });
  },

  getStudentExportCSVUrl: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.course) query.append('course', params.course);
    return `${API_BASE_URL}/api/students/export-csv/?${query.toString()}`;
  },

  getPredictionExportCSVUrl: (params = {}) => {
    const query = new URLSearchParams();
    if (params.student_id) query.append('student_id', params.student_id);
    if (params.category) query.append('category', params.category);
    return `${API_BASE_URL}/api/predictions/export-csv/?${query.toString()}`;
  },
};
