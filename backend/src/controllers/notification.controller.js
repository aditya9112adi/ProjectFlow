import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as notificationService from '../services/notification.service.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await notificationService.getUserNotifications(req.user._id, Number(page), Number(limit));
  res.status(200).json(new ApiResponse(200, result, 'Notifications fetched'));
});

export const markAsRead = asyncHandler(async (req, res) => {
  await notificationService.markNotificationRead(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, {}, 'Marked as read'));
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user._id);
  res.status(200).json(new ApiResponse(200, {}, 'All marked as read'));
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, {}, 'Notification deleted'));
});

export const broadcastAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, type } = req.body;
  if (!title || !message) {
    return res.status(400).json(new ApiResponse(400, null, 'Title and message are required'));
  }
  const count = await notificationService.broadcastToStudents({
    senderId: req.user._id,
    type,
    title,
    message
  });
  res.status(200).json(new ApiResponse(200, { count }, `Announcement sent to ${count} students`));
});
