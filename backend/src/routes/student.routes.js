import { Router } from 'express';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';
import { userController } from '../controllers/user.controller.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();
router.use(verifyJWT, authorizeRoles('student'));

router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);
router.get('/dashboard/stats', userController.getDashboardStats);

export default router;
