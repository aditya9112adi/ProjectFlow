import { Router } from 'express';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';
import { getStudentAnalyticsController, getAdminAnalyticsController } from '../controllers/analytics.controller.js';

const router = Router();
router.use(verifyJWT);

router.get('/student', authorizeRoles('student'), getStudentAnalyticsController);
router.get('/admin', authorizeRoles('admin'), getAdminAnalyticsController);

export default router;
