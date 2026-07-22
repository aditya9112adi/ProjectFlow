import { Team } from '../models/Team.model.js';
import { StudentData } from '../models/StudentData.model.js';
import { Admin } from '../models/Admin.model.js';
import { Project } from '../models/Project.model.js';
import { Notification } from '../models/Notification.model.js';
import { ApiError } from '../utils/ApiError.js';

export const createTeam = async (leaderId, { name, projectDomain, description, memberRollNumbers }) => {
  // Check leader doesn't already have a team
  const leaderInTeam = await Team.findOne({ 'members.user': leaderId, isActive: true });
  if (leaderInTeam) throw new ApiError(400, 'You are already in a team');

  const leader = await StudentData.findById(leaderId);
  if (!leader) throw new ApiError(404, 'Leader not found');

  if (!description) {
    throw new ApiError(400, 'Description is required');
  }
  
  const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 50) {
    throw new ApiError(400, 'Description must be at least 50 words');
  }

  // Validate member roll numbers
  const members = [{ user: leaderId, role: 'leader' }];

  if (!memberRollNumbers || memberRollNumbers.length < 2 || memberRollNumbers.length > 3) {
    throw new ApiError(400, 'A team must have exactly 3 or 4 members (including the leader)');
  }

    for (const rollNum of memberRollNumbers) {
      const formattedPrn = rollNum.includes('@') ? rollNum : `${rollNum}@sguk.ac.in`;
      const student = await StudentData.findOne({ prn: formattedPrn, isActive: true });
      if (!student) throw new ApiError(404, `Student with roll number ${rollNum} not found`);

      // Check if student is already in a team
      const existingTeam = await Team.findOne({ 'members.user': student._id, isActive: true });
      if (existingTeam) {
        throw new ApiError(400, `Student ${rollNum} is already in team "${existingTeam.name}"`);
      }

      if (student._id.toString() === leaderId.toString()) {
        throw new ApiError(400, 'Cannot add yourself as a member');
      }

      members.push({ user: student._id, role: 'member' });
    }

  const team = await Team.create({
    name,
    projectDomain,
    description,
    members,
    department: leader.department,
    academicYear: leader.academicYear,
    section: leader.section,
  });

  // Update all users' team reference
  const memberIds = members.map((m) => m.user);
  await StudentData.updateMany({ _id: { $in: memberIds } }, { team: team._id });

  return await Team.findById(team._id).populate('members.user', 'studentName prn avatar');
};

export const getTeamByUser = async (userId) => {
  const team = await Team.findOne({ 'members.user': userId, isActive: true })
    .populate('members.user', 'studentName prn avatar department')
    .populate('admin', 'firstName lastName email')
    .populate('project');
  return team;
};

export const getTeamById = async (teamId) => {
  const team = await Team.findById(teamId)
    .populate('members.user', 'studentName prn avatar department')
    .populate('admin', 'firstName lastName email')
    .populate('project');
  if (!team || !team.isActive) throw new ApiError(404, 'Team not found');
  return team;
};

export const updateTeam = async (teamId, leaderId, updates) => {
  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(404, 'Team not found');

  if (team.isLocked) throw new ApiError(403, 'Team is locked. Request edit access from your instructor.');

  const isLeader = team.members.some(
    (m) => m.user.toString() === leaderId.toString() && m.role === 'leader'
  );
  if (!isLeader) throw new ApiError(403, 'Only team leader can update team info');

  const allowedUpdates = ['name', 'description', 'projectDomain'];
  allowedUpdates.forEach((key) => {
    if (updates[key] !== undefined) team[key] = updates[key];
  });
  
  if (updates.description !== undefined) {
    if (!updates.description) {
      throw new ApiError(400, 'Description is required');
    }
    const wordCount = updates.description.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 50) {
      throw new ApiError(400, 'Description must be at least 50 words');
    }
  }

  await team.save();
  return await Team.findById(teamId).populate('members.user', 'studentName prn avatar');
};

export const addMember = async (teamId, leaderId, rollNumber) => {
  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(404, 'Team not found');

  if (team.isLocked) throw new ApiError(403, 'Team is locked. Request edit access from your instructor.');

  const isLeader = team.members.some(
    (m) => m.user.toString() === leaderId.toString() && m.role === 'leader'
  );
  if (!isLeader) throw new ApiError(403, 'Only team leader can add members');

  if (team.members.length >= team.maxSize) {
    throw new ApiError(400, `Team is full (max ${team.maxSize} members)`);
  }

  const formattedPrn = rollNumber.includes('@') ? rollNumber : `${rollNumber}@sguk.ac.in`;
  const student = await StudentData.findOne({ prn: formattedPrn, isActive: true });
  if (!student) throw new ApiError(404, `Student with roll number ${rollNumber} not found`);

  const alreadyInTeam = await Team.findOne({ 'members.user': student._id, isActive: true });
  if (alreadyInTeam) throw new ApiError(400, 'Student is already in a team');

  team.members.push({ user: student._id, role: 'member' });
  await team.save();
  await StudentData.findByIdAndUpdate(student._id, { team: team._id });

  return await Team.findById(teamId).populate('members.user', 'studentName prn avatar');
};

export const removeMember = async (teamId, leaderId, memberId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(404, 'Team not found');

  if (team.isLocked) throw new ApiError(403, 'Team is locked. Request edit access from your instructor.');

  const isLeader = team.members.some(
    (m) => m.user.toString() === leaderId.toString() && m.role === 'leader'
  );
  if (!isLeader) throw new ApiError(403, 'Only team leader can remove members');

  if (memberId === leaderId.toString()) throw new ApiError(400, 'Leader cannot remove themselves');

  if (team.members.length <= 3) {
    throw new ApiError(400, 'Team size cannot be less than 3. Please add a new member before removing this one.');
  }

  const memberIndex = team.members.findIndex((m) => m.user.toString() === memberId);
  if (memberIndex === -1) throw new ApiError(404, 'Member not found in team');

  team.members.splice(memberIndex, 1);
  await team.save();
  await StudentData.findByIdAndUpdate(memberId, { team: null });

  return await Team.findById(teamId).populate('members.user', 'studentName prn avatar');
};

export const getAllTeams = async (filters = {}) => {
  const { department, academicYear, page = 1, limit = 20 } = filters;
  const query = { isActive: true };
  if (department) query.department = department;
  if (academicYear) query.academicYear = academicYear;

  const teams = await Team.find(query)
    .populate('members.user', 'studentName prn avatar')
    .populate('project', 'title status currentPhase progress')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Team.countDocuments(query);
  return { teams, total, page: Number(page), limit: Number(limit) };
};

export const deleteTeam = async (teamId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(404, 'Team not found');

  // Unassign students from this team
  await StudentData.updateMany({ team: teamId }, { team: null });
  
  // Optionally handle associated project if exists, but for a hard delete we can just remove the team
  if (team.project) {
    await Project.findByIdAndDelete(team.project);
  }

  await Team.findByIdAndDelete(teamId);
  return { message: 'Team successfully deleted and students unassigned' };
};

export const requestEditAccess = async (teamId, leaderId) => {
  const team = await Team.findById(teamId).populate('members.user', 'studentName prn');
  if (!team) throw new ApiError(404, 'Team not found');
  
  const isLeader = team.members.some(
    (m) => m.user._id.toString() === leaderId.toString() && m.role === 'leader'
  );
  if (!isLeader) throw new ApiError(403, 'Only the team leader can request edit access');
  if (!team.isLocked) throw new ApiError(400, 'Team is already unlocked');
  
  team.editRequestStatus = 'pending';
  await team.save();

  // Find an admin to notify
  const admin = await Admin.findOne();
  if (admin) {
    await Notification.create({
      recipient: admin._id,
      sender: leaderId,
      type: 'warning',
      title: 'Team Edit Request',
      message: `Team "${team.name}" has requested access to edit their team details and members.`,
      link: `/admin/teams`,
    });
  }

  return await getTeamById(teamId);
};

export const approveEditAccess = async (teamId, adminId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(404, 'Team not found');

  team.isLocked = false;
  team.editRequestStatus = 'approved';
  await team.save();

  const leader = team.members.find((m) => m.role === 'leader');
  if (leader) {
    await Notification.create({
      recipient: leader.user,
      sender: adminId,
      type: 'success',
      title: 'Edit Access Approved',
      message: `Your request to edit team "${team.name}" has been approved.`,
      link: `/student/team`,
    });
  }

  return team;
};

export const lockTeam = async (teamId, leaderId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(404, 'Team not found');

  if (team.members.length < 3) {
    throw new ApiError(400, 'Team size cannot be less than 3. Please add members before locking.');
  }

  const isLeader = team.members.some(
    (m) => m.user.toString() === leaderId.toString() && m.role === 'leader'
  );
  if (!isLeader) throw new ApiError(403, 'Only team leader can lock the team');

  team.isLocked = true;
  team.editRequestStatus = 'none';
  await team.save();

  return await getTeamById(teamId);
};

export const adminLockTeam = async (teamId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(404, 'Team not found');

  if (team.members.length < 3) {
    throw new ApiError(400, 'Team size cannot be less than 3. Students must add members before locking.');
  }

  team.isLocked = true;
  team.editRequestStatus = 'none';
  await team.save();

  return await getTeamById(teamId);
};

