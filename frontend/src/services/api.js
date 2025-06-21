import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Автоматическое добавление токена к каждому запросу
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.error('Токен не найден! Перенаправление на /login');
    window.location.href = '/login';
  }
  return config;
});

export default api;