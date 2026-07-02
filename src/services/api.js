import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== URL DE BASE DU BACKEND =====
const BASE_URL = 'https://hflix-backend.onrender.com/api';

// ===== CRÉATION DE L'INSTANCE AXIOS =====
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== INTERCEPTEUR DE REQUÊTE =====
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erreur lecture token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== INTERCEPTEUR DE RÉPONSE =====
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ===== SERVICES AUTHENTIFICATION =====
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  deleteAccount: () => api.delete('/auth/delete-account'),
};

// ===== SERVICES FILMS =====
export const movieService = {
  getAll: (params) => api.get('/movies', { params }),
  getById: (id) => api.get(`/movies/${id}`),
  getPopular: () => api.get('/movies/popular'),
  getNew: () => api.get('/movies/new'),
  getFeatured: () => api.get('/movies/featured'),
};

// ===== SERVICES CATÉGORIES =====
export const categoryService = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
};

// ===== SERVICES PAIEMENT =====
export const paymentService = {
  create: (data) => api.post('/payments', data),
  uploadScreenshot: (id, data) => api.put(`/payments/${id}/screenshot`, data),
  getMyPayments: () => api.get('/payments/my'),
  getPaymentInfo: () => api.get('/payment-info'),
};

// ===== SERVICES UTILISATEUR =====
export const userService = {
  getFavorites: () => api.get('/user/favorites'),
  addToFavorites: (movieId) => api.post(`/user/favorites/${movieId}`),
  removeFromFavorites: (movieId) => api.delete(`/user/favorites/${movieId}`),
  getHistory: () => api.get('/user/history'),
  addToHistory: (movieId) => api.post(`/user/history/${movieId}`),
  saveProgress: (movieId, data) => api.post(`/user/progress/${movieId}`, data),
  getProgress: (movieId) => api.get(`/user/progress/${movieId}`),
  getContinueWatching: () => api.get('/user/continue-watching'),
};

export default api;