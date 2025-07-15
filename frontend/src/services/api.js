import axios from 'axios';

// Auto-detect API base URL based on current host
const getBaseURL = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  } else {
    return `http://${hostname}:5000/api`;
  }
};

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Resources API
export const resourcesAPI = {
  getAll: (params = {}) => api.get('/resources', { params }),
  getById: (id) => api.get(`/resources/${id}`),
  upload: (formData) => api.post('/resources/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  download: (id) => api.get(`/resources/${id}/download`, { responseType: 'blob' }),
  getMyUploads: () => api.get('/resources/user/my-uploads'),
  approve: (id, isApproved) => api.patch(`/resources/${id}/approve`, { isApproved }),
};

// Bookmarks API
export const bookmarksAPI = {
  getAll: () => api.get('/bookmarks'),
  add: (resourceId) => api.post('/bookmarks', { resourceId }),
  remove: (resourceId) => api.delete(`/bookmarks/${resourceId}`),
};

// Feedback API
export const feedbackAPI = {
  add: (feedbackData) => api.post('/feedback', feedbackData),
  getByResource: (resourceId) => api.get(`/feedback/resource/${resourceId}`),
  getMyFeedback: () => api.get('/feedback/user/my-feedback'),
  update: (id, feedbackData) => api.put(`/feedback/${id}`, feedbackData),
  delete: (id) => api.delete(`/feedback/${id}`),
};

// Newsletter API
export const newsletterAPI = {
  subscribe: (email) => api.post('/subscribe', { email }),
  unsubscribe: (email) => api.post('/unsubscribe', { email }),
};

// Calendar API
export const calendarAPI = {
  getEvents: (params = {}) => api.get('/calendar', { params }),
  addEvent: (eventData) => api.post('/calendar', eventData),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;