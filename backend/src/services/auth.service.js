import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.model.js';
import { StudentData } from '../models/StudentData.model.js';
import { ApiError } from '../utils/ApiError.js';

const generateTokens = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

const registerStudent = async (data) => {
  const { studentName, prn, department, academicYear, phoneNumber } = data;
  const formattedPrn = prn.includes('@') ? prn : `${prn}@sguk.ac.in`;
  
  const existingUser = await StudentData.findOne({ prn: formattedPrn });
  if (existingUser) throw new ApiError(409, 'PRN already registered');

  const user = await StudentData.create({
    studentName,
    prn: formattedPrn,
    department,
    academicYear,
    phoneNumber,
    role: 'student',
  });

  return await StudentData.findById(user._id).select('-refreshToken');
};

const loginUser = async (email, password) => {
  const admin = await Admin.findOne({ email });
  if (!admin) throw new ApiError(404, 'Admin not found');
  if (!admin.isActive) throw new ApiError(403, 'Account is deactivated');

  const isPasswordValid = await admin.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, 'Invalid credentials');

  return admin;
};

const loginStudentByPrn = async (prn) => {
  const formattedPrn = prn.includes('@sguk.ac.in') ? prn : `${prn}@sguk.ac.in`;
  const student = await StudentData.findOne({ prn: formattedPrn });
  if (!student) throw new ApiError(404, 'Invalid PRN Number. Access Denied.');
  if (!student.isActive) throw new ApiError(403, 'Account is deactivated');

  return student;
};

const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) throw new ApiError(401, 'Unauthorized request');

  const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  let user;

  if (decodedToken.role === 'admin') {
    user = await Admin.findById(decodedToken._id);
  } else {
    user = await StudentData.findById(decodedToken._id);
  }

  if (!user) throw new ApiError(401, 'Invalid refresh token');
  if (incomingRefreshToken !== user.refreshToken) throw new ApiError(401, 'Refresh token is expired or used');

  return user;
};

export const authService = { generateTokens, registerStudent, loginUser, loginStudentByPrn, refreshAccessToken };
