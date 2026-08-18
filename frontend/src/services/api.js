import axios from 'axios';
import { getApiBaseUrl } from '../lib/backendUrl';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sb_token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('sb_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
};

export const skillsAPI = {
  getAll:        (params)     => api.get('/skills', { params }),
  getCategories: ()           => api.get('/skills/categories'),
  getMySkills:   ()           => api.get('/users/me/skills'),
  create:        (data)       => api.post('/skills', data),
  update:        (id, data)   => api.patch(`/skills/${id}`, data),
  remove:        (id)         => api.delete(`/skills/${id}`),
};

export const matchAPI = {
  getMatches: (params) => api.get('/matches', { params }),
};

export const sessionsAPI = {
  getAll:      (params) => api.get('/sessions', { params }),
  getOne:      (id)     => api.get(`/sessions/${id}`),
  getProgress: ()       => api.get('/sessions/progress'),
  book:        (data)   => api.post('/sessions', data),
  accept:      (id)     => api.patch(`/sessions/${id}/accept`),
  decline:     (id)     => api.patch(`/sessions/${id}/decline`),
  complete:    (id)     => api.patch(`/sessions/${id}/complete`),
  cancel:      (id)     => api.patch(`/sessions/${id}/cancel`),
  rate:        (id, data) => api.post(`/sessions/${id}/rate`, data),
};

export const messagesAPI = {
  getHistory: (otherUserId) => api.get(`/messages/${otherUserId}`),
};

export const notificationsAPI = {
  getAll:         (params) => api.get('/notifications', { params }),
  getUnreadCount: ()       => api.get('/notifications/unread-count'),
  markAsRead:     (id)     => api.patch(`/notifications/${id}/read`),
  markAllAsRead:  ()       => api.patch('/notifications/read-all'),
  remove:         (id)     => api.delete(`/notifications/${id}`),
};

export const pushAPI = {
  getPublicKey: ()           => api.get('/push/vapid-public-key'),
  subscribe:    (data)       => api.post('/push/subscribe', { subscription: data }),
  unsubscribe:  (endpoint)  => api.post('/push/unsubscribe', { endpoint }),
};

export const usersAPI = {
  getProfile: (id)   => api.get(`/users/${id}`),
  updateMe:   (data) => api.patch('/users/me', data),
};

export const communityAPI = {
  getPosts: (params) => api.get('/community/posts', { params }),

  getPost: (id) => api.get(`/community/posts/${id}`),

  createPost: (data) => api.post('/community/posts', data),

  getCategories: () => api.get('/community/categories'),

  upvotePost: (id) => api.post(`/community/posts/${id}/upvote`),

  addReply: (id, data) =>
    api.post(`/community/posts/${id}/replies`, data),

  upvoteReply: (postId, replyId) =>
    api.post(`/community/posts/${postId}/replies/${replyId}/upvote`),

  deletePost: (id) =>
    api.delete(`/community/posts/${id}`),
};
export default api;
