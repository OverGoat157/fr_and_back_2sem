import apiClient from './apiClient';

export const register = (data) => apiClient.post('/api/auth/register', data);
export const login = (data) => apiClient.post('/api/auth/login', data);
export const refresh = (refreshToken) => apiClient.post('/api/auth/refresh', { refreshToken });
export const getMe = () => apiClient.get('/api/auth/me');
