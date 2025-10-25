import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (resetData) => api.post('/auth/reset-password', resetData),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  updateFcmToken: (fcmToken) => api.post('/auth/fcm-token', { fcmToken }),
};

// Events API
export const eventsAPI = {
  getEvents: (params) => api.get('/events', { params }),
  getEventById: (id) => api.get(`/events/${id}`),
  createEvent: (eventData) => api.post('/events', eventData),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  registerForEvent: (id) => api.post(`/events/${id}/register`),
  unregisterFromEvent: (id) => api.delete(`/events/${id}/register`),
  getUserEvents: () => api.get('/events/user/events'),
  getPendingEvents: (params) => api.get('/events/pending', { params }),
  approveEvent: (id) => api.post(`/events/${id}/approve`),
  rejectEvent: (id) => api.post(`/events/${id}/reject`),
};

// Lost & Found API
export const lostFoundAPI = {
  getItems: (params) => api.get('/lost-found', { params }),
  getItemById: (id) => api.get(`/lost-found/${id}`),
  createItem: (itemData) => api.post('/lost-found', itemData),
  updateItem: (id, itemData) => api.put(`/lost-found/${id}`, itemData),
  deleteItem: (id) => api.delete(`/lost-found/${id}`),
  claimItem: (id) => api.post(`/lost-found/${id}/claim`),
  markResolved: (id) => api.post(`/lost-found/${id}/resolve`),
};

// Feedback API
export const feedbackAPI = {
  getFeedback: (params) => api.get('/feedback', { params }),
  getFeedbackById: (id) => api.get(`/feedback/${id}`),
  createFeedback: (feedbackData) => api.post('/feedback', feedbackData),
  updateFeedback: (id, feedbackData) => api.put(`/feedback/${id}`, feedbackData),
  deleteFeedback: (id) => api.delete(`/feedback/${id}`),
  addResponse: (id, response) => api.post(`/feedback/${id}/response`, { response }),
  voteFeedback: (id, voteType) => api.post(`/feedback/${id}/vote`, { voteType }),
};

// Clubs API
export const clubsAPI = {
  getClubs: (params) => api.get('/clubs', { params }),
  getClubById: (id) => api.get(`/clubs/${id}`),
  createClub: (clubData) => api.post('/clubs', clubData),
  updateClub: (id, clubData) => api.put(`/clubs/${id}`, clubData),
  deleteClub: (id) => api.delete(`/clubs/${id}`),
  joinClub: (id) => api.post(`/clubs/${id}/join`),
  leaveClub: (id) => api.delete(`/clubs/${id}/join`),
  getUserClubs: () => api.get('/clubs/user'),
  updateMemberRole: (clubId, memberId, role) => 
    api.put(`/clubs/${clubId}/members/${memberId}`, { role }),
  getPendingClubs: (params) => api.get('/clubs/pending', { params }),
  approveClub: (id) => api.post(`/clubs/${id}/approve`),
  rejectClub: (id) => api.post(`/clubs/${id}/reject`),
};

// Announcements API
export const announcementsAPI = {
  getAnnouncements: (params) => api.get('/announcements', { params }),
  getAnnouncementById: (id) => api.get(`/announcements/${id}`),
  createAnnouncement: (announcementData) => api.post('/announcements', announcementData),
  updateAnnouncement: (id, announcementData) => api.put(`/announcements/${id}`, announcementData),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`),
  markAsRead: (id) => api.post(`/announcements/${id}/read`),
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (message) => api.post('/chatbot', { message }),
};

export default api;
