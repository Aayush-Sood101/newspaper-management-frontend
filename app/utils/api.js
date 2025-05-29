import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const newspaperAPI = {
  getByMonth: (month, year) => api.get(`/api/newspapers/${month}/${year}`),
  create: (data) => api.post('/api/newspapers', data),
  update: (id, data) => api.put(`/api/newspapers/${id}`, data),
  delete: (id) => api.delete(`/api/newspapers/${id}`)
};

export const recordAPI = {
  getByDate: (date) => api.get(`/api/records/${date}`),
  createOrUpdate: (data) => api.post('/api/records', data),
  getReport: (month, year) => api.get(`/api/records/report/${month}/${year}`, {
    responseType: 'blob'
  })
};

export default api;