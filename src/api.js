// src/api.js
import axios from 'axios';
import { notifyServerDown, notifyServerUp } from './hooks/useServerStatus';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // Servidor respondeu = está online
    notifyServerUp();
    return response;
  },
  (error) => {
    // Detectar erro de rede (servidor fora do ar)
    const isNetworkError = !error.response && (error.message === 'Network Error' || error.code === 'ERR_NETWORK');
    if (isNetworkError && !error.config?._skipOfflineNotify) {
      notifyServerDown();
      return Promise.reject(new Error('Servidor fora do ar'));
    }

    // Redireciona para login se token expirar (401)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }

    // Erro de permissão (403)
    if (error.response?.status === 403) {
      const message = error.response?.data?.message || 'Você não tem permissão para realizar esta ação.';
      return Promise.reject(new Error(message));
    }

    // Erro de validação (400) - class-validator retorna array de mensagens
    if (error.response?.status === 400) {
      const data = error.response?.data;
      if (Array.isArray(data?.message)) {
        return Promise.reject(new Error(data.message.join('\n')));
      }
      const message = data?.message || 'Dados inválidos.';
      return Promise.reject(new Error(message));
    }

    const message = error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  }
);

export default api;