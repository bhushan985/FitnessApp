/// <reference types="vite/client" />
import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  return '/api';
};

const API_BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminApi = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.data?.token) {
      localStorage.setItem('adminToken', res.data.data.token);
    }
    return res.data;
  },
  getDashboardStats: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },
  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },
  toggleUserStatus: async (userId: string, status: 'active' | 'blocked') => {
    const res = await api.put(`/admin/users/${userId}/status`, { status });
    return res.data;
  },
  getFoods: async () => {
    const res = await api.get('/foods');
    return res.data;
  },
  createFood: async (data: any) => {
    const res = await api.post('/foods', data);
    return res.data;
  },
  updateFood: async (id: string, data: any) => {
    const res = await api.put(`/foods/${id}`, data);
    return res.data;
  },
  deleteFood: async (id: string) => {
    const res = await api.delete(`/foods/${id}`);
    return res.data;
  },
  getRegions: async () => {
    const res = await api.get('/regions');
    return res.data;
  },
  createRegion: async (data: any) => {
    const res = await api.post('/regions', data);
    return res.data;
  },
  getAuditLogs: async () => {
    const res = await api.get('/admin/audit-logs');
    return res.data;
  },
  // Memberships API
  getPlans: async () => {
    const res = await api.get('/admin/plans');
    return res.data;
  },
  createPlan: async (data: any) => {
    const res = await api.post('/admin/plans', data);
    return res.data;
  },
  updatePlan: async (id: string, data: any) => {
    const res = await api.put(`/admin/plans/${id}`, data);
    return res.data;
  },
  // Trainers API
  getTrainers: async () => {
    const res = await api.get('/admin/trainers');
    return res.data;
  },
  createTrainer: async (data: any) => {
    const res = await api.post('/admin/trainers', data);
    return res.data;
  },
  // Exercises API
  getExercises: async () => {
    const res = await api.get('/admin/exercises');
    return res.data;
  },
  createExercise: async (data: any) => {
    const res = await api.post('/admin/exercises', data);
    return res.data;
  },
};
