import { Router } from 'express';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';
import * as teamController from '../controllers/team.controller.js';

const router = Router();
router.use(verifyJWT);

// Student routes
router.post('/create', authorizeRoles('student'), teamController.createTeam);
router.get('/lookup/:rollNumber', authorizeRoles('student'), teamController.lookupStudent);
router.get('/my-team', authorizeRoles('student'), teamController.getMyTeam);
router.post('/:teamId/members', authorizeRoles('student'), teamController.addMember);
router.delete('/:teamId/members/:memberId', authorizeRoles('student'), teamController.removeMember);
router.delete('/:teamId/leave', authorizeRoles('student'), teamController.leaveTeam);
router.post('/:teamId/request-edit', authorizeRoles('student'), teamController.requestEditAccess);
router.post('/:teamId/lock', authorizeRoles('student'), teamController.lockTeam);

// Admin routes
router.get('/', authorizeRoles('admin'), teamController.getAllTeams);
router.get('/:teamId', teamController.getTeamById);
router.delete('/:teamId', authorizeRoles('admin'), teamController.deleteTeam);
router.post('/:teamId/approve-edit', authorizeRoles('admin'), teamController.approveEditAccess);
router.post('/:teamId/admin-lock', authorizeRoles('admin'), teamController.adminLockTeam);

export default router;
