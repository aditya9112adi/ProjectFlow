import { Router } from 'express';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';
import { userController } from '../controllers/user.controller.js';
import * as notificationController from '../controllers/notification.controller.js';
import { upload } from '../middleware/upload.middleware.js';
import { StudentData } from '../models/StudentData.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = Router();
router.use(verifyJWT, authorizeRoles('admin'));

router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);
router.get('/dashboard/stats', userController.getDashboardStats);

router.post('/notifications/broadcast', notificationController.broadcastAnnouncement);

router.get('/students', asyncHandler(async (req, res) => {
  const { department, academicYear, page = 1, limit = 20 } = req.query;
  const filter = { isActive: true };
  if (department) filter.department = department;
  if (academicYear) filter.academicYear = academicYear;

  const students = await StudentData.find(filter)
    .select('-refreshToken')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await StudentData.countDocuments(filter);
  res.status(200).json(new ApiResponse(200, { students, total, page: Number(page), limit: Number(limit) }, 'Students fetched'));
}));

export default router;
