import { Router } from 'express';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';
import * as projectController from '../controllers/project.controller.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();
router.use(verifyJWT);

// Student routes
router.post('/', authorizeRoles('student'), projectController.createProject);
router.get('/my-project', authorizeRoles('student'), projectController.getMyProject);
router.post('/:projectId/phases/:phase/submit', authorizeRoles('student'), upload.array('files', 5), projectController.submitPhase);

// Admin routes
router.get('/', authorizeRoles('admin'), projectController.getAllProjects);
router.get('/pending-reviews', authorizeRoles('admin'), projectController.getPendingReviews);
router.post('/:projectId/phases/:phase/review', authorizeRoles('admin'), projectController.reviewPhase);
router.get('/:projectId', projectController.getProjectById);

export default router;
