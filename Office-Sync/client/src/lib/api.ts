import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    try {
      const { token } = JSON.parse(currentUser);
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

export default api;
