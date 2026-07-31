import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
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
  getMatches: () => api.get('/matches'),
};

export const sessionsAPI = {
  getAll:    (params) => api.get('/sessions', { params }),
  getOne:    (id)     => api.get(`/sessions/${id}`),
  book:      (data)   => api.post('/sessions', data),
  complete:  (id)     => api.patch(`/sessions/${id}/complete`),
  cancel:    (id)     => api.patch(`/sessions/${id}/cancel`),
  rate:      (id, data) => api.post(`/sessions/${id}/rate`, data),
};

export const messagesAPI = {
  getHistory: (otherUserId) => api.get(`/messages/${otherUserId}`),
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
