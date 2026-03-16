import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const sessionYear = typeof window !== 'undefined' ? (localStorage.getItem('session_year') || new Date().getFullYear().toString()) : new Date().getFullYear().toString();
  config.headers['X-Session-Year'] = sessionYear;

  return config;
});

export default api;
