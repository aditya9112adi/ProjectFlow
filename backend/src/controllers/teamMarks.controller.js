import { Team } from '../models/Team.model.js';
import { Project } from '../models/Project.model.js';
import { TeamMarks } from '../models/TeamMarks.model.js';
import { ApiError } from '../utils/ApiError.js';

// Get Teams Progress (Status Tab)
export const getTeamsProgress = async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true }).populate('members.user');
    
    // We need to fetch projects for these teams and populate submission references
    const projects = await Project.find({ team: { $in: teams.map(t => t._id) } })
      .populate('proposalId')
      .populate('pptId')
      .populate('prototypeId')
      .populate('reportId');
    const projectMap = {};
    projects.forEach(p => { projectMap[p.team.toString()] = p; });

    let stats = {
      totalTeams: teams.length,
      proposalPending: 0,
      proposalSubmitted: 0,
      pptPending: 0,
      pptSubmitted: 0,
      prototypePending: 0,
      prototypeSubmitted: 0,
      reportPending: 0,
      reportSubmitted: 0,
    };

    const teamsData = teams.map(team => {
      const project = projectMap[team._id.toString()];
      const phases = project?.phases || {};
      
      const proposalSubmitted = !!phases.proposal?.submittedAt;
      const pptSubmitted = !!phases.ppt?.submittedAt;
      const prototypeSubmitted = !!phases.prototypePhase?.submittedAt;
      const reportSubmitted = !!phases.report?.submittedAt;

      // Update stats
      if (proposalSubmitted) stats.proposalSubmitted++; else stats.proposalPending++;
      if (pptSubmitted) stats.pptSubmitted++; else stats.pptPending++;
      if (prototypeSubmitted) stats.prototypeSubmitted++; else stats.prototypePending++;
      if (reportSubmitted) stats.reportSubmitted++; else stats.reportPending++;

      // Determine current stage for display
      let currentStageStr = 'No Submission';
      if (project?.status === 'completed') {
        currentStageStr = 'Completed';
      } else if (reportSubmitted) {
        currentStageStr = 'Report Submitted';
      } else if (prototypeSubmitted) {
        currentStageStr = 'Prototype Submitted';
      } else if (pptSubmitted) {
        currentStageStr = 'PPT Submitted';
      } else if (proposalSubmitted) {
        currentStageStr = 'Proposal Submitted';
      }

      return {
        _id: team._id,
        name: team.name,
        admin: team.admin, // Guide
        members: team.members,
        proposal: proposalSubmitted,
        ppt: pptSubmitted,
        prototype: prototypeSubmitted,
        report: reportSubmitted,
        currentStage: currentStageStr,
        project: project,
        isLocked: team.isLocked,
      };
    });

    res.json({
      success: true,
      data: {
        stats,
        teams: teamsData,
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

// Get Teams Marks (Marks Tab)
export const getTeamsMarks = async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true }).populate('members.user');
    const marks = await TeamMarks.find({ team: { $in: teams.map(t => t._id) } });
    
    const marksMap = {};
    marks.forEach(m => { marksMap[m.team.toString()] = m; });

    // We also need project status to know if they submitted
    const projects = await Project.find({ team: { $in: teams.map(t => t._id) } });
    const projectMap = {};
    projects.forEach(p => { projectMap[p.team.toString()] = p; });

    const marksData = teams.map(team => {
      const teamMarks = marksMap[team._id.toString()] || {};
      const project = projectMap[team._id.toString()];
      const phases = project?.phases || {};

      const proposalSubmitted = !!phases.proposal?.submittedAt;
      const pptSubmitted = !!phases.ppt?.submittedAt;
      const prototypeSubmitted = !!phases.prototypePhase?.submittedAt;
      const reportSubmitted = !!phases.report?.submittedAt;
      const completed = project?.status === 'completed';

      return {
        _id: team._id,
        name: team.name,
        members: team.members,
        marks: {
          proposalMarks: teamMarks.proposalMarks !== null ? teamMarks.proposalMarks : '',
          pptMarks: teamMarks.pptMarks !== null ? teamMarks.pptMarks : '',
          prototypeMarks: teamMarks.prototypeMarks !== null ? teamMarks.prototypeMarks : '',
          reportMarks: teamMarks.reportMarks !== null ? teamMarks.reportMarks : '',
          totalMarks: teamMarks.totalMarks || 0,
          evaluated: !!teamMarks._id, // True if there's a record
        },
        status: {
          proposalSubmitted,
          pptSubmitted,
          prototypeSubmitted,
          reportSubmitted,
          completed,
        }
      };
    });

    res.json({
      success: true,
      data: marksData
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

import { getIO } from '../config/socket.js';

// Save Marks (Bulk or Single)
export const saveMarks = async (req, res) => {
  try {
    const { updates } = req.body; // Expecting an array of { teamId, proposalMarks, pptMarks, prototypeMarks, reportMarks }
    
    if (!Array.isArray(updates)) {
      throw new ApiError(400, 'Invalid data format. Expected an array of updates.');
    }

    const adminId = req.user._id;

    for (const update of updates) {
      const { teamId, proposalMarks, pptMarks, prototypeMarks, reportMarks } = update;
      
      if (!teamId) continue;
      
      const p = proposalMarks === '' || proposalMarks === undefined ? null : Number(proposalMarks);
      const pt = pptMarks === '' || pptMarks === undefined ? null : Number(pptMarks);
      const pr = prototypeMarks === '' || prototypeMarks === undefined ? null : Number(prototypeMarks);
      const r = reportMarks === '' || reportMarks === undefined ? null : Number(reportMarks);

      let teamMarks = await TeamMarks.findOne({ team: teamId });
      
      if (!teamMarks) {
        teamMarks = new TeamMarks({ team: teamId });
      }

      teamMarks.proposalMarks = p;
      teamMarks.pptMarks = pt;
      teamMarks.prototypeMarks = pr;
      teamMarks.reportMarks = r;
      teamMarks.evaluatedBy = adminId;
      
      await teamMarks.save(); // pre-save hook calculates total
      
      // Notify team members
      getIO().to(`team_${teamId}`).emit('marks_updated');
    }

    res.json({
      success: true,
      message: 'Marks updated successfully'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};
