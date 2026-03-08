import axios from 'axios';
import { auth } from './firebase';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5001/restaurant-proto-c1826/us-central1/api/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Auth token
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const apiService = {
  // Public Endpoints
  getRestaurant: async (slug: string) => {
    const response = await api.get(`/restaurants/${slug}`);
    return response.data;
  },

  getMenu: async (slug: string) => {
    const response = await api.get(`/restaurants/${slug}/menu`);
    return response.data;
  },

  getPublicCategories: async (slug: string) => {
    const response = await api.get(`/restaurants/${slug}/categories`);
    return response.data;
  },

  createOrder: async (orderData: { restaurantSlug: string, tableNumber: string, items: any[], total: number }) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Protected Endpoints (Admin)
  getOrders: async () => {
    const response = await api.get('/admin/orders');
    return response.data;
  },

  getTeam: async () => {
    const response = await api.get('/admin/team');
    return response.data;
  },

  inviteMember: async (data: { email: string, name: string, role: 'admin' | 'member' }) => {
    const response = await api.post('/admin/team/invite', data);
    return response.data;
  },

  updateOrganization: async (data: any) => {
    const response = await api.patch('/admin/organization', data);
    return response.data;
  },

  getOrganization: async () => {
    const response = await api.get('/admin/organization');
    return response.data;
  },

  // Category Management
  getCategories: async () => {
    const response = await api.get('/admin/categories');
    return response.data;
  },

  addCategory: async (data: { name: string }) => {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // Menu Item Management (Updated Endpoints)
  getItems: async () => {
    const response = await api.get('/admin/items');
    return response.data;
  },

  addMenuItem: async (data: any) => {
    const response = await api.post('/admin/items', data);
    return response.data;
  },

  updateMenuItem: async (id: string, data: any) => {
    const response = await api.patch(`/admin/items/${id}`, data);
    return response.data;
  },

  updateOrder: async (id: string, data: { status: string }) => {
    const response = await api.patch(`/admin/orders/${id}`, data);
    return response.data;
  },

  deleteMenuItem: async (id: string) => {
    const response = await api.delete(`/admin/items/${id}`);
    return response.data;
  },

  getOrderByNumber: async (orderNumber: string, restaurantSlug: string) => {
    // Robust guard to prevent calls with empty/invalid order numbers
    if (!orderNumber || typeof orderNumber !== 'string' || !orderNumber.trim()) {
      console.warn(`[apiService] getOrderByNumber skipped: Invalid orderNumber ("${orderNumber}")`);
      return null;
    }
    
    console.log(`[apiService] Fetching order: ${orderNumber} for restaurant: ${restaurantSlug}`);
    try {
      const response = await api.get(`/orders/track/${orderNumber}`, {
        params: { restaurantSlug }
      });
      return response.data;
    } catch (error) {
      console.error(`[apiService] getOrderByNumber failed for ${orderNumber}:`, error);
      throw error;
    }
  },

  submitFeedback: async (orderId: string, data: { rating: number, feedback: string, restaurantSlug: string }) => {
    const response = await api.post(`/orders/${orderId}/feedback`, data);
    return response.data;
  },

  getAllFeedback: async () => {
    const response = await api.get('/orders/admin/feedback');
    return response.data;
  },
  
  // Helper to check if API is reachable (optional)
  healthCheck: async () => {
      try {
          await api.get('/');
          return true;
      } catch (e) {
          return false;
      }
  }
};

export default api;
