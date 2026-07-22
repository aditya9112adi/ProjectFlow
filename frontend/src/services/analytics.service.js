import api from './api.js';

export const analyticsService = {
  getAdminAnalytics: () => api.get('/analytics/admin'),
  getStudentAnalytics: () => api.get('/analytics/student'),
};
