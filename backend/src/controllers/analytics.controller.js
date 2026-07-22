import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { getStudentAnalytics, getAdminAnalytics } from '../services/analytics.service.js';

export const getStudentAnalyticsController = asyncHandler(async (req, res) => {
  const data = await getStudentAnalytics(req.user._id);
  res.status(200).json(new ApiResponse(200, data, 'Analytics fetched'));
});

export const getAdminAnalyticsController = asyncHandler(async (req, res) => {
  const data = await getAdminAnalytics();
  res.status(200).json(new ApiResponse(200, data, 'Admin analytics fetched'));
});
