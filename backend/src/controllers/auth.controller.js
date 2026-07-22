import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { authService } from '../services/auth.service.js';
import { Admin } from '../models/Admin.model.js';
import { StudentData } from '../models/StudentData.model.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
};

const register = asyncHandler(async (req, res) => {
  const user = await authService.registerStudent(req.body);
  res.status(201).json(new ApiResponse(201, user, 'Student registered successfully'));
});

const login = asyncHandler(async (req, res) => {
  const { email, password, prn } = req.body;
  
  let user;
  if (prn) {
    user = await authService.loginStudentByPrn(prn);
  } else {
    if (!email || !password) throw new ApiError(400, 'Email and password are required');
    user = await authService.loginUser(email, password);
  }

  const { accessToken, refreshToken } = await authService.generateTokens(user);

  let loggedInUser;
  if (user.role === 'admin') {
    loggedInUser = await Admin.findById(user._id).select('-password -refreshToken');
  } else {
    loggedInUser = await StudentData.findById(user._id).select('-refreshToken');
  }

  res
    .status(200)
    .cookie('accessToken', accessToken, COOKIE_OPTIONS)
    .cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 10 * 24 * 60 * 60 * 1000 })
    .json(new ApiResponse(200, { user: loggedInUser, accessToken }, 'Login successful'));
});

const logout = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') {
    await Admin.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });
  } else {
    await StudentData.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });
  }
  
  res
    .status(200)
    .clearCookie('accessToken', COOKIE_OPTIONS)
    .clearCookie('refreshToken', COOKIE_OPTIONS)
    .json(new ApiResponse(200, {}, 'Logout successful'));
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  const user = await authService.refreshAccessToken(incomingRefreshToken);
  const { accessToken, refreshToken: newRefreshToken } = await authService.generateTokens(user);

  res
    .status(200)
    .cookie('accessToken', accessToken, COOKIE_OPTIONS)
    .cookie('refreshToken', newRefreshToken, { ...COOKIE_OPTIONS, maxAge: 10 * 24 * 60 * 60 * 1000 })
    .json(new ApiResponse(200, { accessToken }, 'Access token refreshed'));
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, 'User fetched successfully'));
});

export const authController = { register, login, logout, refreshToken, getMe };
