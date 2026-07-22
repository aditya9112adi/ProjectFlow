import api from './api.js';

export const projectService = {
  createProject: (data) => api.post('/projects', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    timeout: 120000,
  }),
  getMyProject: () => api.get('/projects/my-project'),
  getProjectById: (id) => api.get(`/projects/${id}`),
  getAllProjects: (params) => api.get('/projects', { params }),
  getPendingReviews: () => api.get('/projects/pending-reviews'),

  submitPhase: (projectId, phase, data) => 
    api.post(`/projects/${projectId}/phases/${phase}/submit`, data, { 
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
      timeout: 120000 
    }),

  reviewPhase: (projectId, phase, data) =>
    api.post(`/projects/${projectId}/phases/${phase}/review`, data),
};
