import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.model.js';
import { StudentData } from '../models/StudentData.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
  if (!token) throw new ApiError(401, 'Unauthorized request');

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  let user;
  
  if (decodedToken.role === 'admin') {
    user = await Admin.findById(decodedToken._id).select('-password -refreshToken');
  } else {
    user = await StudentData.findById(decodedToken._id).select('-refreshToken');
  }

  if (!user) throw new ApiError(401, 'Invalid Access Token');
  if (!user.isActive) throw new ApiError(403, 'Account is deactivated');

  req.user = user;
  next();
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      throw new ApiError(403, `Role '${req.user?.role}' is not authorized to access this resource`);
    }
    next();
  };
};
