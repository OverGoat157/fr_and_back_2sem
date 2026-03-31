import apiClient from './apiClient';

export const getAll = () => apiClient.get('/api/products');
export const getById = (id) => apiClient.get(`/api/products/${id}`);
export const create = (data) => apiClient.post('/api/products', data);
export const update = (id, data) => apiClient.put(`/api/products/${id}`, data);
export const remove = (id) => apiClient.delete(`/api/products/${id}`);
