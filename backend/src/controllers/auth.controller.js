import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { authService } from '../services/auth.service.js';
import { Admin } from '../models/Admin.model.js';
import { StudentData } from '../models/StudentData.model.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    .cookie('accessToken', accessToken, COOKIE_OPTIONS)
    .cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 10 * 24 * 60 * 60 * 1000 })
    .json(new ApiResponse(200, { user: loggedInUser, accessToken }, 'Login successful'));
});

const googleLogin = asyncHandler(async (req, res) => {
  const { accessToken: googleAccessToken } = req.body;
  if (!googleAccessToken) throw new ApiError(400, 'Google access token is required');

  let email;
  try {
    // Fetch user info from Google using the access token
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${googleAccessToken}` },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user info from Google');
    }
    
    const data = await response.json();
    email = data.email;
  } catch (err) {
    throw new ApiError(401, 'Invalid Google access token');
  }

  if (!email || !email.endsWith('@sguk.ac.in')) {
    throw new ApiError(403, 'Only @sguk.ac.in email addresses are allowed');
  }

  // Extract PRN: 252921001@sguk.ac.in -> 252921001
  const prn = email.split('@')[0];
  
  if (!prn || isNaN(prn)) {
    throw new ApiError(400, 'Invalid email format. PRN not found.');
  }

  // Find user by PRN
  const user = await authService.loginStudentByPrn(prn);
  const { accessToken, refreshToken } = await authService.generateTokens(user);

  const loggedInUser = await StudentData.findById(user._id).select('-refreshToken');

  res
    .status(200)
    .cookie('accessToken', accessToken, COOKIE_OPTIONS)
    .cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 10 * 24 * 60 * 60 * 1000 })
    .json(new ApiResponse(200, { user: loggedInUser, accessToken }, 'Google Login successful'));
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

export const authController = { register, login, googleLogin, logout, refreshToken, getMe };
