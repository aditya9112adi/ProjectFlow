import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { StudentData } from '../models/StudentData.model.js';
import { Admin } from '../models/Admin.model.js';
import { uploadOnCloudinary } from '../config/cloudinary.js';

const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, 'Profile fetched'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { studentName, firstName, lastName, phoneNumber, department, academicYear } = req.body;
  let user;

  if (req.user.role === 'admin') {
    user = await Admin.findByIdAndUpdate(
      req.user._id,
      { $set: { firstName, lastName, phoneNumber, department, academicYear } },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');
  } else {
    user = await StudentData.findByIdAndUpdate(
      req.user._id,
      { $set: { studentName, phoneNumber, department, academicYear } },
      { new: true, runValidators: true }
    ).select('-refreshToken');
  }

  res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
});

const uploadAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) throw new ApiError(400, 'Avatar file is required');

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  let user;
  
  if (req.user.role === 'admin') {
    user = await Admin.findByIdAndUpdate(
      req.user._id,
      { $set: { avatar: avatar.url } },
      { new: true }
    ).select('-password -refreshToken');
  } else {
    user = await StudentData.findByIdAndUpdate(
      req.user._id,
      { $set: { avatar: avatar.url } },
      { new: true }
    ).select('-refreshToken');
  }

  res.status(200).json(new ApiResponse(200, user, 'Avatar uploaded successfully'));
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = {
    totalStudents: req.user.role === 'admin'
      ? await StudentData.countDocuments({ isActive: true })
      : undefined,
    profileComplete: Boolean(
      (req.user.role === 'student' ? req.user.prn : req.user.email)
    ),
    role: req.user.role,
  };
  res.status(200).json(new ApiResponse(200, stats, 'Dashboard stats fetched'));
});

export const userController = { getProfile, updateProfile, uploadAvatar, getDashboardStats };
