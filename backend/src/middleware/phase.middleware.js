import { Project } from '../models/Project.model.js';
import { Team } from '../models/Team.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Verify student is the team leader
export const requireTeamLeader = asyncHandler(async (req, res, next) => {
  const team = await Team.findOne({
    'members.user': req.user._id,
    'members.role': 'leader',
    isActive: true,
  });

  if (!team) {
    throw new ApiError(403, 'Only team leaders can perform this action');
  }

  req.team = team;
  next();
});

// Require previous phase to be approved
export const requirePhaseApproved = (requiredPhase) => {
  return asyncHandler(async (req, res, next) => {
    const projectId = req.params.projectId || req.params.id;
    const project = await Project.findById(projectId);

    if (!project) throw new ApiError(404, 'Project not found');

    const phaseOrder = ['proposal', 'ppt', 'report', 'prototype'];
    const requiredIndex = phaseOrder.indexOf(requiredPhase);

    if (requiredIndex > 0) {
      const previousPhase = phaseOrder[requiredIndex - 1];
      if (project.phases[previousPhase]?.status !== 'approved') {
        throw new ApiError(
          400,
          `Cannot submit ${requiredPhase}. Please wait for ${previousPhase} approval first.`
        );
      }
    }

    req.project = project;
    next();
  });
};

// Verify student belongs to the team associated with the project
export const verifyProjectAccess = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;
  const project = await Project.findById(projectId).populate('team');

  if (!project) throw new ApiError(404, 'Project not found');

  const isMember = project.team.members.some(
    (m) => m.user.toString() === req.user._id.toString()
  );

  if (!isMember && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have access to this project');
  }

  req.project = project;
  next();
});
