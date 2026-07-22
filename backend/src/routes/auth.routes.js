import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Admin } from '../models/Admin.model.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', verifyJWT, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', verifyJWT, authController.getMe);

router.patch('/change-password', verifyJWT, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can change password');
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new ApiError(400, 'Both passwords required');
  if (newPassword.length < 8) throw new ApiError(400, 'New password must be at least 8 characters');

  const admin = await Admin.findById(req.user._id);
  const isValid = await admin.isPasswordCorrect(currentPassword);
  if (!isValid) throw new ApiError(400, 'Current password is incorrect');

  admin.password = newPassword;
  await admin.save();
  res.status(200).json(new ApiResponse(200, {}, 'Password changed successfully'));
}));

export default router;
