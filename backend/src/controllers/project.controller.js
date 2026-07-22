import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as projectService from '../services/project.service.js';
import { getAdminAnalytics } from '../services/analytics.service.js';

export const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, project, 'Project created'));
});

export const getMyProject = asyncHandler(async (req, res) => {
  const project = await projectService.getMyProject(req.user._id);
  res.status(200).json(new ApiResponse(200, project, 'Project fetched'));
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.projectId);
  res.status(200).json(new ApiResponse(200, project, 'Project fetched'));
});

export const submitPhase = asyncHandler(async (req, res) => {
  const { projectId, phase } = req.params;
  const files = req.files;



  const project = await projectService.submitPhase(req.user._id, projectId, phase, req.body, files);
  res.status(200).json(new ApiResponse(200, project, `${phase} submitted for review`));
});

export const reviewPhase = asyncHandler(async (req, res) => {
  const { projectId, phase } = req.params;
  const { decision, feedback } = req.body;
  if (!['approved', 'rejected'].includes(decision)) throw new ApiError(400, 'Decision must be approved or rejected');
  const project = await projectService.reviewSubmission({
    adminId: req.user._id,
    projectId,
    phase,
    action: decision,
    comments: feedback
  });
  res.status(200).json(new ApiResponse(200, project, `Phase ${decision}`));
});

export const getAllProjects = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, department } = req.query;
  const { Project } = await import('../models/Project.model.js');
  const filter = { isActive: true };
  if (status) filter.status = status;
  if (department) filter.department = department;

  const projects = await Project.find(filter)
    .populate('team', 'name teamCode members')
    .populate('admin', 'firstName lastName email')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ updatedAt: -1 });

  const total = await Project.countDocuments(filter);
  res.status(200).json(new ApiResponse(200, { projects, total, page: Number(page) }, 'Projects fetched'));
});

export const getPendingReviews = asyncHandler(async (req, res) => {
  const pendingItems = await projectService.getPendingReviews(req.user._id);
  res.status(200).json(new ApiResponse(200, { items: pendingItems, total: pendingItems.length }, 'Pending reviews fetched'));
});
