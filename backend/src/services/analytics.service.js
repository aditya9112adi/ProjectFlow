import { StudentData } from '../models/StudentData.model.js';
import { Team } from '../models/Team.model.js';
import { Project } from '../models/Project.model.js';

export const getStudentAnalytics = async (userId) => {
  const project = await Project.findOne({ 'team.members.user': userId })
    .populate('team');

  if (!project) {
    return {
      hasProject: false,
      progress: 0,
      currentPhase: 'proposal',
      completedPhases: 0,
      totalPhases: 4,
    };
  }

  const phases = ['proposal', 'ppt', 'report', 'prototypePhase'];
  const completedPhases = phases.filter(
    (p) => project.phases?.[p]?.status === 'approved'
  ).length;

  return {
    hasProject: true,
    projectId: project._id,
    projectTitle: project.title,
    progress: project.progress || 0,
    currentPhase: project.currentPhase || 'proposal',
    completedPhases,
    totalPhases: 4,
    proposalRejections: project.phases?.proposal?.reviews?.filter(r => r.action === 'rejected').length || 0,
    phaseStatuses: phases.reduce((acc, p) => {
      const key = p === 'prototypePhase' ? 'prototype' : p;
      acc[key] = project.phases?.[p]?.status || 'not_started';
      return acc;
    }, {}),
    projectStatus: project.status,
  };
};

export const getAdminAnalytics = async () => {
  const [totalStudents, totalTeams, projects] = await Promise.all([
    StudentData.countDocuments({ isActive: true }),
    Team.countDocuments({ isActive: true }),
    Project.find({ isActive: true }),
  ]);

  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;
  const inProgressProjects = projects.filter((p) => p.status === 'in_progress').length;
  const completionRate = totalProjects ? Math.round((completedProjects / totalProjects) * 100) : 0;

  // Count all pending reviews and rejected proposals
  let totalPending = 0;
  let totalRejectedProposals = 0;
  const pendingItems = [];
  for (const project of projects) {
    if (!project.phases) continue;
    
    // Count proposal rejections
    if (project.phases.proposal?.reviews) {
      totalRejectedProposals += project.phases.proposal.reviews.filter(r => r.action === 'rejected').length;
    }

    const phases = ['proposal', 'ppt', 'report', 'prototypePhase'];
    for (const phase of phases) {
      if (project.phases[phase]?.status === 'submitted') {
        totalPending++;
        pendingItems.push({
          projectId: project._id,
          projectTitle: project.title,
          teamId: project.team,
          phase: phase === 'prototypePhase' ? 'prototype' : phase,
          submittedAt: project.phases[phase].submittedAt,
        });
      }
    }
  }

  // Sort by submittedAt
  pendingItems.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));

  return {
    totalStudents,
    totalTeams,
    totalProjects,
    completedProjects,
    inProgressProjects,
    completionRate,
    totalPending,
    totalRejectedProposals,
    pendingItems,
  };
};
