import axios from 'axios';
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Payment API
export const paymentApi = {
  getPricing: () => api.get('/payments/pricing'),
  processPayment: (data: {
    nonce: string;
    storyType: string;
    packageType: string;
    storyId?: string;
    bundleType?: string;
  }) => api.post('/payments/process', data),
  getHistory: () => api.get('/payments/history')
};

// Genre API
export const genreApi = {
  getAll: () => api.get('/genres'),
  create: (name: string, description?: string) => api.post('/genres', { name, description })
};
