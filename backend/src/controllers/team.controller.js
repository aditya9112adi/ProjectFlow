import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as teamService from '../services/team.service.js';

export const createTeam = asyncHandler(async (req, res) => {
  const team = await teamService.createTeam(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, team, 'Team created successfully'));
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
