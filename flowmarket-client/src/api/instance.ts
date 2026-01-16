import axios from 'axios';

// Используем адрес твоего локального бэкенда для разработки
// Когда будем деплоить, поменяем на адрес сервера
export const API_URL = 'http://localhost:5009/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
