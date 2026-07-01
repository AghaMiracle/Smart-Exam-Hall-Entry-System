import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = 'https://smart-exam-hall-entry-system.onrender.com/api';


const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — inject JWT access token
apiClient.interceptors.request.use(
  (config) => {
    const session = JSON.parse(localStorage.getItem('institution_session'));
    if (session && session.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 + auto refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const session = JSON.parse(localStorage.getItem('institution_session'));
        if (session?.refreshToken) {
          const refreshRes = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken: session.refreshToken,
          });

          if (refreshRes.data?.success && refreshRes.data?.data?.accessToken) {
            session.accessToken = refreshRes.data.data.accessToken;
            localStorage.setItem('institution_session', JSON.stringify(session));
            originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        localStorage.removeItem('institution_session');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      'An error occurred';

    return Promise.reject(new Error(message));
  }
);

/**
 * Helper to unwrap the standard API response: { success, message, data }
 */
const unwrap = (res) => res.data?.data ?? res.data;

export const api = {
  auth: {
    signup: async (data) => {
      const res = await apiClient.post('/auth/register', {
        institutionName: data.institutionName || data.name,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone || '',
        address: data.address || '',
      });
      const payload = res.data;
      if (!payload.success) throw new Error(payload.message || 'Registration failed');

      const session = {
        accessToken: payload.data.accessToken,
        refreshToken: payload.data.refreshToken,
        user: payload.data.user,
        institution: payload.data.institution,
      };
      localStorage.setItem('institution_session', JSON.stringify(session));
      return session;
    },

    login: async (email, password) => {
      const res = await apiClient.post('/auth/login', { email, password });
      const payload = res.data;
      if (!payload.success) throw new Error(payload.message || 'Login failed');

      const session = {
        accessToken: payload.data.accessToken,
        refreshToken: payload.data.refreshToken,
        user: payload.data.user,
        institution: payload.data.institution,
      };
      localStorage.setItem('institution_session', JSON.stringify(session));
      return session;
    },

    forgotPassword: async (email) => {
      const res = await apiClient.post('/auth/forgot-password', {
        email,
        userType: 'user',
      });
      return unwrap(res);
    },

    resetPassword: async (token, password) => {
      const res = await apiClient.post('/auth/reset-password', {
        token,
        password,
        userType: 'user',
      });
      return unwrap(res);
    },

    logout: async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch (e) {
        // Ignore — token may have expired
      }
      localStorage.removeItem('institution_session');
    },
  },

  students: {
    list: async (params = {}) => {
      const res = await apiClient.get('/students', { params });
      return unwrap(res);
    },
    create: async (data) => {
      const res = await apiClient.post('/students', data);
      return unwrap(res);
    },
    get: async (id) => {
      const res = await apiClient.get(`/students/${id}`);
      return unwrap(res);
    },
    update: async (id, data) => {
      const res = await apiClient.put(`/students/${id}`, data);
      return unwrap(res);
    },
    updateStatus: async (id, status) => {
      const res = await apiClient.patch(`/students/${id}/status`, { status });
      return unwrap(res);
    },
    getFilterOptions: async () => {
      const res = await apiClient.get('/students/filter-options');
      return unwrap(res);
    },
    bulkImport: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/students/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return unwrap(res);
    },
    export: async (format = 'csv') => {
      const res = await apiClient.get(`/students/export?format=${format}`, {
        responseType: 'blob',
      });
      return res.data;
    },
  },

  exams: {
    list: async (params = {}) => {
      const res = await apiClient.get('/exams', { params });
      return unwrap(res);
    },
    create: async (data) => {
      const res = await apiClient.post('/exams', data);
      return unwrap(res);
    },
    get: async (id) => {
      const res = await apiClient.get(`/exams/${id}`);
      return unwrap(res);
    },
    update: async (id, data) => {
      const res = await apiClient.put(`/exams/${id}`, data);
      return unwrap(res);
    },
    updateStatus: async (id, status) => {
      const res = await apiClient.patch(`/exams/${id}/status`, { status });
      return unwrap(res);
    },
    delete: async (id) => {
      const res = await apiClient.delete(`/exams/${id}`);
      return unwrap(res);
    },
  },

  qrCodes: {
    generate: async (data) => {
      const res = await apiClient.post('/qrcodes/generate', data);
      return unwrap(res);
    },
    bulkGenerate: async (data) => {
      const res = await apiClient.post('/qrcodes/bulk-generate', data);
      return unwrap(res);
    },
    listByExam: async (examId) => {
      const res = await apiClient.get(`/qrcodes/exam/${examId}`);
      return unwrap(res);
    },
    generateExamQR: async (examId) => {
      const res = await apiClient.post('/qrcodes/exam-qr', { examId });
      return unwrap(res);
    },
    verify: async (encryptedPayload) => {
      const res = await apiClient.post('/qrcodes/verify', { encryptedPayload });
      return unwrap(res);
    },
    get: async (id) => {
      const res = await apiClient.get(`/qrcodes/${id}`);
      return unwrap(res);
    },
    regenerate: async (id) => {
      const res = await apiClient.patch(`/qrcodes/${id}/regenerate`);
      return unwrap(res);
    },
  },

  attendance: {
    list: async (params = {}) => {
      const res = await apiClient.get('/attendance', { params });
      return unwrap(res);
    },
    byExam: async (examId) => {
      const res = await apiClient.get(`/attendance/exam/${examId}`);
      return unwrap(res);
    },
    examStats: async (examId) => {
      const res = await apiClient.get(`/attendance/exam/${examId}/stats`);
      return unwrap(res);
    },
    export: async (examId, format = 'csv') => {
      const res = await apiClient.get(`/attendance/export/${examId}?format=${format}`, {
        responseType: 'blob',
      });
      return res.data;
    },
  },

  dashboard: {
    get: async () => {
      const res = await apiClient.get('/dashboard/institution');
      return unwrap(res);
    },
    trends: async (params = {}) => {
      const res = await apiClient.get('/dashboard/trends', { params });
      return unwrap(res);
    },
  },

  auditLogs: {
    list: async (params = {}) => {
      const res = await apiClient.get('/audit-logs', { params });
      return unwrap(res);
    },
  },
};

export default api;
