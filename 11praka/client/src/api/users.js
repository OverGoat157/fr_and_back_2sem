import apiClient from './apiClient';

export const getAll = () => apiClient.get('/api/users');
export const getById = (id) => apiClient.get(`/api/users/${id}`);
export const update = (id, data) => apiClient.put(`/api/users/${id}`, data);
export const toggleBlock = (id) => apiClient.delete(`/api/users/${id}`);
