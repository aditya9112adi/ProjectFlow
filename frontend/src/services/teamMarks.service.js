import api from './api.js';

export const teamMarksService = {
  getTeamsProgress: () => api.get('/teams/progress'),
  getTeamsMarks: () => api.get('/teams/marks'),
  saveMarks: (updates) => api.put('/teams/marks', { updates }),
  getStudentMarks: () => api.get('/teams/student-marks'),
  saveStudentMarks: (updates) => api.put('/teams/student-marks', { updates }),
};
