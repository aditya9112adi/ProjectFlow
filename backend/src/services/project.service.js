import { Project } from '../models/Project.model.js';
import { Proposal } from '../models/Proposal.model.js';
import { PPTSubmission } from '../models/PPTSubmission.model.js';
import { ReportSubmission } from '../models/ReportSubmission.model.js';
import { PrototypeSubmission } from '../models/PrototypeSubmission.model.js';
import { Team } from '../models/Team.model.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadOnCloudinary } from '../config/cloudinary.js';
import { notifyPhaseDecision } from './notification.service.js';
import { sendApprovalEmail } from './email.service.js';
import { StudentData } from '../models/StudentData.model.js';

// Get or create project for a team
export const getOrCreateProject = async (teamId) => {
  let project = await Project.findOne({ team: teamId, isActive: true });
  if (!project) {
    const team = await Team.findById(teamId);
    project = await Project.create({
      team: teamId,
      department: team.department,
      academicYear: team.academicYear,
      section: team.section,
      status: 'in_progress',
    });
    await Team.findByIdAndUpdate(teamId, { project: project._id });
  }
  return project;
};

// PROPOSAL
export const submitProposal = async (teamId, submittedBy, data) => {
  let project = await getOrCreateProject(teamId);

  if (project?.phases?.proposal?.status === 'approved') {
    throw new ApiError(400, 'Proposal already approved');
  }

  let proposal = null;
  if (project.proposalId) {
    proposal = await Proposal.findById(project.proposalId);
  }

  if (proposal) {
    // Update existing (resubmission)
    const previousRevision = {
      submittedAt: proposal.submittedAt,
      previousStatus: proposal.status,
      adminComment: proposal.adminComments,
      version: proposal.version,
    };
    proposal.revisions.push(previousRevision);
    Object.assign(proposal, data);
    proposal.status = 'submitted';
    proposal.submittedAt = new Date();
    proposal.version += 1;
    proposal.adminComments = undefined;
    await proposal.save();
  } else {
    proposal = await Proposal.create({
      project: project._id,
      team: teamId,
      submittedBy,
      ...data,
      status: 'submitted',
      submittedAt: new Date(),
    });
    project.proposalId = proposal._id;
    project.title = data.title;
  }

  if (!project.phases.proposal) project.phases.proposal = {};
  project.phases.proposal.status = 'submitted';
  project.phases.proposal.submittedAt = new Date();
  project.phases.proposal.version = (project.phases.proposal.version || 0) + 1;
  project.status = 'in_progress';
  await project.save();

  return { project, proposal };
};

// PPT
export const submitPPT = async (teamId, submittedBy, driveLink) => {
  const project = await Project.findOne({ team: teamId, isActive: true });
  if (!project) throw new ApiError(404, 'Project not found');
  if (project?.phases?.proposal?.status !== 'approved') {
    throw new ApiError(400, 'Proposal must be approved before submitting PPT');
  }
  if (project?.phases?.ppt?.status === 'approved') {
    throw new ApiError(400, 'PPT already approved');
  }

  if (!driveLink) {
    throw new ApiError(400, 'Google Drive link is required for PPT submission');
  }

  let ppt = null;
  if (project.pptId) {
    ppt = await PPTSubmission.findById(project.pptId);
  }

  if (ppt) {
    ppt.previousVersions.push({
      driveLink: ppt.driveLink, submittedAt: ppt.submittedAt, version: ppt.version,
    });
    ppt.driveLink = driveLink;
    ppt.status = 'submitted';
    ppt.submittedAt = new Date();
    ppt.version += 1;
    ppt.adminComments = undefined;
    await ppt.save();
  } else {
    ppt = await PPTSubmission.create({
      project: project._id, team: teamId, submittedBy,
      driveLink,
      status: 'submitted',
      submittedAt: new Date(),
    });
    project.pptId = ppt._id;
  }

  if (!project.phases.ppt) project.phases.ppt = {};
  project.phases.ppt.status = 'submitted';
  project.phases.ppt.submittedAt = new Date();
  await project.save();

  return { project, ppt };
};

// REPORT
export const submitReport = async (teamId, submittedBy, driveLink) => {
  const project = await Project.findOne({ team: teamId, isActive: true });
  if (!project) throw new ApiError(404, 'Project not found');
  if (project?.phases?.prototypePhase?.status !== 'approved') {
    throw new ApiError(400, 'Prototype must be approved before submitting report');
  }
  if (project?.phases?.report?.status === 'approved') {
    throw new ApiError(400, 'Report already approved');
  }

  if (!driveLink) {
    throw new ApiError(400, 'Google Drive link is required for report submission');
  }

  let report = null;
  if (project.reportId) {
    report = await ReportSubmission.findById(project.reportId);
  }

  if (report) {
    report.previousVersions.push({
      driveLink: report.driveLink, submittedAt: report.submittedAt, version: report.version,
    });
    report.driveLink = driveLink;
    report.status = 'submitted';
    report.submittedAt = new Date();
    report.version += 1;
    report.adminComments = undefined;
    await report.save();
  } else {
    report = await ReportSubmission.create({
      project: project._id, team: teamId, submittedBy,
      driveLink,
      status: 'submitted',
      submittedAt: new Date(),
    });
    project.reportId = report._id;
  }

  if (!project.phases.report) project.phases.report = {};
  project.phases.report.status = 'submitted';
  project.phases.report.submittedAt = new Date();
  await project.save();

  return { project, report };
};

// PROTOTYPE
export const submitPrototype = async (teamId, submittedBy, data) => {
  const project = await Project.findOne({ team: teamId, isActive: true });
  if (!project) throw new ApiError(404, 'Project not found');
  if (project?.phases?.ppt?.status !== 'approved') {
    throw new ApiError(400, 'PPT must be approved before submitting prototype');
  }
  if (project?.phases?.prototype?.status === 'approved') {
    throw new ApiError(400, 'Prototype already approved');
  }

  let prototype = null;
  if (project.prototypeId) {
    prototype = await PrototypeSubmission.findById(project.prototypeId);
  }

  if (prototype) {
    Object.assign(prototype, {
      githubRepo: data.githubRepo,
      liveUrl: data.liveUrl,
      status: 'submitted',
      submittedAt: new Date(),
      adminComments: undefined,
    });
    await prototype.save();
  } else {
    prototype = await PrototypeSubmission.create({
      project: project._id, team: teamId, submittedBy,
      githubRepo: data.githubRepo,
      liveUrl: data.liveUrl,
      status: 'submitted',
      submittedAt: new Date(),
    });
    project.prototypeId = prototype._id;
  }

  if (!project.phases.prototypePhase) project.phases.prototypePhase = {};
  project.phases.prototypePhase.status = 'submitted';
  project.phases.prototypePhase.submittedAt = new Date();
  await project.save();

  return { project, prototype };
};

export const submitPhase = async (userId, projectId, phase, data, files) => {
  let teamId;
  if (projectId && projectId !== 'undefined') {
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, 'Project not found');
    teamId = project.team;
  } else {
    const team = await Team.findOne({ 'members.user': userId, isActive: true });
    if (!team) throw new ApiError(404, 'Team not found');
    teamId = team._id;
  }
  
  if (phase === 'proposal') {
    return submitProposal(teamId, userId, data);
  } else if (phase === 'ppt') {
    return submitPPT(teamId, userId, data.driveLink);
  } else if (phase === 'report') {
    return submitReport(teamId, userId, data.driveLink);
  } else if (phase === 'prototype') {
    return submitPrototype(teamId, userId, data);
  }
  
  throw new ApiError(400, 'Invalid phase');
};

// ADMIN REVIEW
export const reviewSubmission = async ({ adminId, projectId, phase, action, comments }) => {
  const project = await Project.findById(projectId).populate('team');
  if (!project) throw new ApiError(404, 'Project not found');

  const validActions = ['approved', 'rejected', 'returned'];
  if (!validActions.includes(action)) throw new ApiError(400, 'Invalid action');

  // Update the phase submission status
  const phaseModelMap = {
    proposal: 'proposalId',
    ppt: 'pptId',
    report: 'reportId',
    prototype: 'prototypeId',
  };

  const submissionId = project[phaseModelMap[phase]];
  if (!submissionId) throw new ApiError(404, `No ${phase} submission found`);

  const modelMap = {
    proposal: (await import('../models/Proposal.model.js')).Proposal,
    ppt: (await import('../models/PPTSubmission.model.js')).PPTSubmission,
    report: (await import('../models/ReportSubmission.model.js')).ReportSubmission,
    prototype: (await import('../models/PrototypeSubmission.model.js')).PrototypeSubmission,
  };

  const submission = await modelMap[phase].findById(submissionId);
  if (!submission) throw new ApiError(404, 'Submission not found');

  const finalStatus = action === 'returned' ? 'rejected' : action;
  submission.status = finalStatus;
  submission.reviewedBy = adminId;
  submission.reviewedAt = new Date();
  submission.adminComments = comments;
  await submission.save();

  // Update project phase
  const phaseKey = phase === 'prototype' ? 'prototypePhase' : phase;
  if (!project.phases[phaseKey]) project.phases[phaseKey] = { reviews: [] };
  if (!project.phases[phaseKey].reviews) project.phases[phaseKey].reviews = [];
  project.phases[phaseKey].status = finalStatus;
  if (action === 'approved') {
    project.phases[phaseKey].approvedAt = new Date();
  }
  project.phases[phaseKey].reviews.push({
    reviewedBy: adminId,
    action,
    comments,
    reviewedAt: new Date(),
  });

  // Recalculate progress
  project.recalculateProgress();
  project.admin = adminId;
  await project.save();

  // Get project title for notifications
  const projectTitle = project.title || `Team's Project`;

  // Send notifications to team
  await notifyPhaseDecision({
    teamId: project.team._id,
    adminId,
    phase,
    status: action,
    projectTitle,
    projectId: project._id,
    comments,
  });

  // Send emails to team members
  const team = await (await import('../models/Team.model.js')).Team.findById(project.team._id).populate('members.user', 'studentName prn');
  if (team) {
    for (const member of team.members) {
      await sendApprovalEmail({
        to: member.user.prn,
        name: member.user.studentName,
        projectTitle,
        phase,
        status: action,
        comments,
      }).catch(() => {}); // Don't fail if email fails
    }
  }

  return project;
};

export const getMyProject = async (userId) => {
  const { Team } = await import('../models/Team.model.js');
  const team = await Team.findOne({ 'members.user': userId, isActive: true });
  if (!team) return null;
  return await getProjectByTeam(team._id);
};



export const getProjectByTeam = async (teamId) => {
  return await Project.findOne({ team: teamId, isActive: true })
    .populate('team', 'name teamCode members')
    .populate('proposalId')
    .populate('pptId')
    .populate('reportId')
    .populate('prototypeId');
};

export const getProjectById = async (projectId) => {
  return await Project.findById(projectId)
    .populate({ path: 'team', populate: { path: 'members.user', select: 'studentName prn avatar' } })
    .populate('proposalId')
    .populate('pptId')
    .populate('reportId')
    .populate('prototypeId')
    .populate('admin', 'firstName lastName email');
};

export const getAllProjects = async (filters = {}) => {
  const { status, department, academicYear, phase, page = 1, limit = 20 } = filters;
  const query = { isActive: true };
  if (status) query.status = status;
  if (department) query.department = department;
  if (academicYear) query.academicYear = academicYear;
  if (phase) query.currentPhase = phase;

  const projects = await Project.find(query)
    .populate('team', 'name teamCode members')
    .populate('admin', 'firstName lastName')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ updatedAt: -1 });

  const total = await Project.countDocuments(query);
  return { projects, total, page: Number(page), limit: Number(limit) };
};

export const getPendingReviews = async (adminId) => {
  // Get all projects with at least one submitted phase
  const projects = await Project.find({
    isActive: true,
    $or: [
      { 'phases.proposal.status': 'submitted' },
      { 'phases.ppt.status': 'submitted' },
      { 'phases.report.status': 'submitted' },
      { 'phases.prototypePhase.status': 'submitted' },
    ],
  })
    .populate({ path: 'team', populate: { path: 'members.user', select: 'studentName prn' } })
    .populate('proposalId')
    .populate('pptId')
    .populate('prototypeId')
    .populate('reportId')
    .sort({ updatedAt: -1 });

  // Map to pending review items
  const pendingItems = [];
  for (const project of projects) {
    const phases = ['proposal', 'ppt', 'prototypePhase', 'report'];
    for (const phase of phases) {
      if (project.phases[phase]?.status === 'submitted') {
        const displayPhase = phase === 'prototypePhase' ? 'prototype' : phase;
        const item = {
          projectId: project._id,
          projectTitle: project.title,
          teamName: project.team?.name,
          teamCode: project.team?.teamCode,
          members: project.team?.members,
          phase: displayPhase,
          submittedAt: project.phases[phase].submittedAt,
          department: project.department,
          academicYear: project.academicYear,
        };
        
        if (displayPhase === 'proposal' && project.proposalId) {
          item.domain = project.proposalId.domain;
          item.problemStatement = project.proposalId.problemStatement;
          item.solution = project.proposalId.solution;
        } else if (displayPhase === 'ppt' && project.pptId) {
          item.pptId = { driveLink: project.pptId.driveLink };
        } else if (displayPhase === 'prototype' && project.prototypeId) {
          item.prototypeId = {
            githubRepo: project.prototypeId.githubRepo,
            liveUrl: project.prototypeId.liveUrl
          };
        } else if (displayPhase === 'report' && project.reportId) {
          item.reportId = {
            driveLink: project.reportId.driveLink
          };
        }
        
        pendingItems.push(item);
      }
    }
  }

  return pendingItems;
};
