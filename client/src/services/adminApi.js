import axios from "axios";

const API_BASE_URL = "/api";

const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    "Content-Type": "application/json",
  },
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export const adminAuthAPI = {
  login: async (credentials) => {
    const response = await adminApi.post("/login", credentials);
    return response.data;
  },
};

export const adminDashboardAPI = {
  getStats: async () => {
    const response = await adminApi.get("/dashboard");
    return response.data;
  },
};

export const adminUserAPI = {
  getUsers: async (params = {}) => {
    const response = await adminApi.get("/users", { params });
    return response.data;
  },

  getUser: async (id) => {
    const response = await adminApi.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await adminApi.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await adminApi.delete(`/users/${id}`);
    return response.data;
  },

  pingUser: async (id, data) => {
    const response = await adminApi.post(`/users/${id}/ping`, data);
    return response.data;
  },

  unpingUser: async (id) => {
    const response = await adminApi.delete(`/users/${id}/ping`);
    return response.data;
  },

  getPingedUsers: async () => {
    const response = await adminApi.get("/users/pinged/list");
    return response.data;
  },

  pauseUserEarnings: async (id) => {
    const response = await adminApi.post(`/users/${id}/pause-earnings`);
    return response.data;
  },

  resumeUserEarnings: async (id) => {
    const response = await adminApi.post(`/users/${id}/resume-earnings`);
    return response.data;
  },
};

export const adminTransactionAPI = {
  getTransactions: async (params = {}) => {
    const response = await adminApi.get("/transactions", { params });
    return response.data;
  },

  updateTransaction: async (id, data) => {
    const response = await adminApi.put(`/transactions/${id}`, data);
    return response.data;
  },

  updateTransactionStatus: async (id, status) => {
    const response = await adminApi.patch(`/transactions/${id}/status`, {
      status,
    });
    return response.data;
  },
};

export const adminPlanAPI = {
  getPlans: async () => {
    const response = await adminApi.get("/plans");
    return response.data;
  },

  createPlan: async (planData) => {
    const response = await adminApi.post("/plans", planData);
    return response.data;
  },

  updatePlan: async (id, planData) => {
    const response = await adminApi.put(`/plans/${id}`, planData);
    return response.data;
  },

  deletePlan: async (id) => {
    const response = await adminApi.delete(`/plans/${id}`);
    return response.data;
  },
};

export const adminChatAPI = {
  getChats: async (params = {}) => {
    const response = await adminApi.get("/chats", { params });
    return response.data;
  },

  getChat: async (id) => {
    const response = await adminApi.get(`/chats/${id}`);
    return response.data;
  },

  sendMessage: async (chatId, message) => {
    const response = await adminApi.post(`/chats/${chatId}/messages`, {
      message,
    });
    return response.data;
  },

  updateChat: async (id, data) => {
    const response = await adminApi.put(`/chats/${id}`, data);
    return response.data;
  },
};

export default adminApi;
