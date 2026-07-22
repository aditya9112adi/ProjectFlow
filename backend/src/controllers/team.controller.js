import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as teamService from '../services/team.service.js';

import { StudentData } from '../models/StudentData.model.js';
import { TeamInvitation } from '../models/TeamInvitation.model.js';
import { Notification } from '../models/Notification.model.js';

export const createTeam = asyncHandler(async (req, res) => {
  const { memberRollNumbers } = req.body;
  
  // Verify all invited members have accepted the invitation from this leader
  if (memberRollNumbers && memberRollNumbers.length > 0) {
    const students = await StudentData.find({ prn: { $in: memberRollNumbers.map(r => r.includes('@') ? r : `${r}@sguk.ac.in`) } });
    const studentIds = students.map(s => s._id.toString());
    
    // Except the leader themselves if included
    const invitees = studentIds.filter(id => id !== req.user._id.toString());
    
    for (const inviteeId of invitees) {
      const invite = await TeamInvitation.findOne({
        leader: req.user._id,
        invitee: inviteeId,
        status: 'accepted'
      });
      if (!invite) {
        throw new ApiError(400, `Cannot create team. All members must accept your invitation first.`);
      }
    }
    
    // Clear invitations after successful team creation
    await TeamInvitation.deleteMany({
      leader: req.user._id,
      invitee: { $in: invitees }
    });
  }

  const team = await teamService.createTeam(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, team, 'Team created successfully'));
});

export const sendInvitation = asyncHandler(async (req, res) => {
  const { rollNumber, teamName, projectDomain, description } = req.body;
  
  const formattedPrn = rollNumber.includes('@') ? rollNumber : `${rollNumber}@sguk.ac.in`;
  const invitee = await StudentData.findOne({ prn: formattedPrn, isActive: true });
  
  if (!invitee) throw new ApiError(404, 'Student not found');
  if (invitee._id.toString() === req.user._id.toString()) throw new ApiError(400, 'Cannot invite yourself');

  // Check if they already have a team
  const existingTeam = await teamService.getTeamByUser(invitee._id).catch(() => null);
  if (existingTeam) throw new ApiError(400, 'Student is already in a team');

  // Check if invite already exists
  let invitation = await TeamInvitation.findOne({
    leader: req.user._id,
    invitee: invitee._id,
  });

  if (invitation) {
    if (invitation.status === 'accepted') throw new ApiError(400, 'Student has already accepted your invitation');
    // Update existing pending/rejected invitation
    invitation.status = 'pending';
    invitation.teamName = teamName;
    invitation.projectDomain = projectDomain;
    invitation.description = description;
    await invitation.save();
  } else {
    invitation = await TeamInvitation.create({
      leader: req.user._id,
      invitee: invitee._id,
      teamName,
      projectDomain,
      description
    });
  }

  // Send notification to invitee
  await Notification.create({
    recipient: invitee._id,
    recipientModel: 'StudentData',
    title: 'New Team Invitation',
    message: `${req.user.firstName} has invited you to join the team: ${teamName}`,
    type: 'team_invite',
    relatedId: invitation._id,
    relatedModel: 'TeamInvitation'
  });

  res.status(200).json(new ApiResponse(200, invitation, 'Invitation sent successfully'));
});

export const getMyInvitations = asyncHandler(async (req, res) => {
  const incoming = await TeamInvitation.find({ invitee: req.user._id, status: 'pending' })
    .populate('leader', 'firstName lastName studentName prn avatar')
    .sort({ createdAt: -1 });
    
  const outgoing = await TeamInvitation.find({ leader: req.user._id })
    .populate('invitee', 'firstName lastName studentName prn avatar')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { incoming, outgoing }, 'Invitations fetched'));
});

export const respondToInvitation = asyncHandler(async (req, res) => {
  const { invitationId } = req.params;
  const { action } = req.body; // 'accept' or 'reject'

  const invitation = await TeamInvitation.findOne({ _id: invitationId, invitee: req.user._id });
  if (!invitation) throw new ApiError(404, 'Invitation not found');
  if (invitation.status !== 'pending') throw new ApiError(400, `Invitation is already ${invitation.status}`);

  if (action === 'accept') {
    // Ensure they are not already in a team
    const existingTeam = await teamService.getTeamByUser(req.user._id).catch(() => null);
    if (existingTeam) throw new ApiError(400, 'You are already in a team');
    
    invitation.status = 'accepted';
  } else if (action === 'reject') {
    invitation.status = 'rejected';
  } else {
    throw new ApiError(400, 'Invalid action');
  }

  await invitation.save();

  // Notify leader
  await Notification.create({
    recipient: invitation.leader,
    recipientModel: 'StudentData',
    title: `Invitation ${action === 'accept' ? 'Accepted' : 'Declined'}`,
    message: `${req.user.firstName} has ${action === 'accept' ? 'accepted' : 'declined'} your invitation to join ${invitation.teamName}`,
    type: 'team_update',
  });

  res.status(200).json(new ApiResponse(200, invitation, `Invitation ${action}ed`));
});

export const lookupStudent = asyncHandler(async (req, res) => {
  const { rollNumber } = req.params;
  const { StudentData } = await import('../models/StudentData.model.js');
  const formattedPrn = rollNumber.includes('@') ? rollNumber : `${rollNumber}@sguk.ac.in`;
  const student = await StudentData.findOne({ prn: formattedPrn, isActive: true })
    .select('studentName prn department avatar');
  if (!student) throw new ApiError(404, 'Student not found');
  res.status(200).json(new ApiResponse(200, student, 'Student found'));
});

export const getMyTeam = asyncHandler(async (req, res) => {
  const team = await teamService.getTeamByUser(req.user._id);
  res.status(200).json(new ApiResponse(200, team, 'Team fetched'));
});

export const addMember = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { rollNumber } = req.body;
  const team = await teamService.addMember(teamId, req.user._id, rollNumber);
  res.status(200).json(new ApiResponse(200, team, 'Member added'));
});

export const removeMember = asyncHandler(async (req, res) => {
  const { teamId, memberId } = req.params;
  const team = await teamService.removeMember(teamId, req.user._id, memberId);
  res.status(200).json(new ApiResponse(200, team, 'Member removed'));
});

export const leaveTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  await teamService.removeMember(teamId, req.user._id, req.user._id.toString());
  res.status(200).json(new ApiResponse(200, {}, 'Left team successfully'));
});

export const getTeamById = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const team = await teamService.getTeamById(teamId);
  res.status(200).json(new ApiResponse(200, team, 'Team fetched'));
});

export const getAllTeams = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, department, academicYear } = req.query;
  const filter = { isActive: true };
  if (department) filter.department = department;
  if (academicYear) filter.academicYear = academicYear;

  const { Team } = await import('../models/Team.model.js');
  const { Project } = await import('../models/Project.model.js');

  const teams = await Team.find(filter)
    .populate('members.user', 'studentName prn avatar firstName lastName rollNumber')
    .populate('admin', 'firstName lastName email')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .lean();

  const teamIds = teams.map(t => t._id);
  const projects = await Project.find({ team: { $in: teamIds } })
    .populate('proposalId')
    .populate('pptId')
    .populate('prototypeId')
    .populate('reportId')
    .lean();
  
  const projectMap = projects.reduce((acc, p) => {
    acc[p.team] = p;
    return acc;
  }, {});

  teams.forEach(t => {
    t.project = projectMap[t._id] || null;
  });

  const total = await Team.countDocuments(filter);
  res.status(200).json(new ApiResponse(200, { teams, total, page: Number(page) }, 'Teams fetched'));
});

export const deleteTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const result = await teamService.deleteTeam(teamId);
  res.status(200).json(new ApiResponse(200, result, 'Team deleted successfully'));
});

export const requestEditAccess = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const team = await teamService.requestEditAccess(teamId, req.user._id);
  res.status(200).json(new ApiResponse(200, team, 'Edit access requested successfully'));
});

export const approveEditAccess = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const team = await teamService.approveEditAccess(teamId, req.user._id);
  res.status(200).json(new ApiResponse(200, team, 'Edit access approved successfully'));
});

export const lockTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const team = await teamService.lockTeam(teamId, req.user._id);
  res.status(200).json(new ApiResponse(200, team, 'Team locked successfully'));
});

export const adminLockTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const team = await teamService.adminLockTeam(teamId);
  res.status(200).json(new ApiResponse(200, team, 'Team locked successfully by admin'));
});
