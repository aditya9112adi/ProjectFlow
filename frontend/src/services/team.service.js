import api from './api.js';

export const teamService = {
  createTeam: (data) => api.post('/teams/create', data),
  getMyTeam: () => api.get('/teams/my-team'),
  getTeamById: (teamId) => api.get(`/teams/${teamId}`),
  updateTeam: (teamId, data) => api.patch(`/teams/${teamId}`, data),
  addMember: (teamId, rollNumber) => api.post(`/teams/${teamId}/members`, { rollNumber }),
  removeMember: (teamId, memberId) => api.delete(`/teams/${teamId}/members/${memberId}`),
  leaveTeam: (teamId) => api.delete(`/teams/${teamId}/leave`),
  lookupStudent: (rollNumber) => api.get(`/teams/lookup/${rollNumber}`),
  getAllTeams: (params) => api.get('/teams', { params }),
  deleteTeam: (teamId) => api.delete(`/teams/${teamId}`),
  requestEditAccess: (teamId) => api.post(`/teams/${teamId}/request-edit`),
  approveEditAccess: (teamId) => api.post(`/teams/${teamId}/approve-edit`),
  lockTeam: (teamId) => api.post(`/teams/${teamId}/lock`),
  adminLockTeam: (teamId) => api.post(`/teams/${teamId}/admin-lock`),
};
