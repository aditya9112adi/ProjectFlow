import { Notification } from '../models/Notification.model.js';
import { StudentData } from '../models/StudentData.model.js';
import { Team } from '../models/Team.model.js';
import { getIO } from '../config/socket.js';

export const createNotification = async ({
  recipientId,
  senderId,
  type = 'info',
  title,
  message,
  link,
}) => {
  return await Notification.create({
    recipient: recipientId,
    sender: senderId,
    type,
    title,
    message,
    link,
  });
};

export const notifyTeam = async (teamId, notification) => {
  const team = await Team.findById(teamId).select('members');
  if (!team) return;

  const promises = team.members.map((m) =>
    createNotification({ ...notification, recipientId: m.user })
  );
  await Promise.all(promises);
};

export const notifyPhaseDecision = async ({
  teamId,
  adminId,
  phase,
  status,
  projectTitle,
  projectId,
  comments,
}) => {
  const phaseLabel = phase.charAt(0).toUpperCase() + phase.slice(1);
  const typeMap = { approved: 'success', rejected: 'error', returned: 'warning' };
  const iconMap = { approved: '✅', rejected: '❌', returned: '🔄' };

  const title = `${phaseLabel} ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  const message = comments
    ? `Your ${phaseLabel} for "${projectTitle}" was ${status}. Comment: ${comments}`
    : `Your ${phaseLabel} for "${projectTitle}" has been ${status}.`;

  await notifyTeam(teamId, {
    senderId: adminId,
    type: typeMap[status] || 'info',
    title,
    message,
    link: `/student/project`,
  });
};

export const broadcastToStudents = async ({ senderId, type = 'info', title, message }) => {
  const allStudents = await StudentData.find({ isActive: true }).select('_id');
  if (allStudents.length === 0) return 0;

  const notificationsToInsert = allStudents.map(student => ({
    recipient: student._id,
    sender: senderId,
    type,
    title,
    message,
  }));

  await Notification.insertMany(notificationsToInsert);

  // Broadcast to all online students
  getIO().to('students').emit('new_notification', {
    title,
    message,
    type,
    createdAt: new Date()
  });

  return allStudents.length;
};
