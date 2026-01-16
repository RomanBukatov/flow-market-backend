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

// Интерцептор ОТВЕТА (Ловим ошибки)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если сервер сказал "401 Unauthorized"
    if (error.response && error.response.status === 401) {
      // Чистим данные
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      // Жесткий редирект на логин
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
