import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
  
  login: async (userData) => {
    const response = await api.post('/auth/login', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

export const transactionAPI = {
  getTransactions: async (filters = {}) => {
    const response = await api.get('/user/transactions', { params: filters });
    return response.data;
  },
  
  createTransaction: async (transactionData) => {
    const response = await api.post('/user/transactions', transactionData);
    return response.data;
  },
  
  getTransactionById: async (id) => {
    const response = await api.get(`/user/transactions/${id}`);
    return response.data;
  }
};

export const userAPI = {
  getDashboardData: async () => {
    const response = await api.get('/user/dashboard');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.put('/user/profile', userData);
    return response.data;
  },
  
  getBalance: async () => {
    const response = await api.get('/user/balance');
    return response.data;
  },

  deposit: async (depositData) => {
    const response = await api.post('/user/deposit', depositData);
    return response.data;
  },

  uploadImage: async (imageData) => {
    const response = await api.post('/user/upload-image', imageData);
    return response.data;
  },

  withdraw: async (withdrawalData) => {
    const response = await api.post('/user/withdraw', withdrawalData);
    return response.data;
  }
};

export const chatAPI = {
  getChat: async () => {
    const response = await api.get('/user/chat');
    return response.data;
  },

  sendMessage: async (message) => {
    const response = await api.post('/user/chat/message', { message });
    return response.data;
  },

  markAsRead: async () => {
    const response = await api.patch('/user/chat/read');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/user/chat/unread-count');
    return response.data;
  }
};

export default api;