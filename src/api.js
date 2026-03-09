// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Adiciona token em qualquer requisição autenticada
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log apenas para requisições de userSettings
      if (config.url?.includes('userSettings')) {
        console.log('📤 Token adicionado no header:', {
          url: config.url,
          method: config.method?.toUpperCase(),
          tokenPrefix: token.substring(0, 20) + '...',
          headerExists: !!config.headers.Authorization
        });
      }
    } else {
      console.warn('⚠️ Nenhum token disponível para requisição:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Redireciona para login se token expirar (401)
    if (error.response?.status === 401) {
      const isUserSettings = error.config?.url?.includes('userSettings');
      console.error('❌ Erro 401 - Token inválido ou expirado:', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        hasAuthHeader: !!error.config?.headers?.Authorization,
        authHeaderValue: error.config?.headers?.Authorization?.substring(0, 30) + '...',
        responseMessage: error.response?.data?.message,
        responseData: error.response?.data,
        isUserSettings: isUserSettings
      });
      
      if (isUserSettings) {
        console.group('🔍 Debug de autenticação para userSettings');
        console.log('Token no localStorage:', localStorage.getItem('token')?.substring(0, 30) + '...');
        console.log('User no localStorage:', localStorage.getItem('user'));
        console.groupEnd();
      }
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }

    const message = error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  }
);

export default api;