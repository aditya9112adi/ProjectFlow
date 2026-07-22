import api from './api.js';

export const teamMarksService = {
  getTeamsProgress: () => api.get('/teams/progress'),
  getTeamsMarks: () => api.get('/teams/marks'),
  saveMarks: (updates) => api.put('/teams/marks', { updates }),
};
