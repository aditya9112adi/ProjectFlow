import { Team } from '../models/Team.model.js';
import { Project } from '../models/Project.model.js';
import { StudentMarks } from '../models/StudentMarks.model.js';
import { StudentData } from '../models/StudentData.model.js';
import { ApiError } from '../utils/ApiError.js';

// Get all student marks
export const getStudentMarks = async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true }).populate('members.user');
    
    // Get all project statuses to know if submissions exist
    const projects = await Project.find({ team: { $in: teams.map(t => t._id) } });
    const projectMap = {};
    projects.forEach(p => { projectMap[p.team.toString()] = p; });

    // Fetch existing StudentMarks
    const marks = await StudentMarks.find({ team: { $in: teams.map(t => t._id) } });
    const marksMap = {};
    marks.forEach(m => { marksMap[m.student.toString()] = m; });

    const studentData = [];

    teams.forEach(team => {
      const project = projectMap[team._id.toString()];
      const phases = project?.phases || {};

      const proposalSubmitted = !!phases.proposal?.submittedAt;
      const pptSubmitted = !!phases.ppt?.submittedAt;
      const prototypeSubmitted = !!phases.prototypePhase?.submittedAt;
      const reportSubmitted = !!phases.report?.submittedAt;

      team.members.forEach(member => {
        if (!member.user) return; // Skip if user not populated somehow
        const student = member.user;
        const sMarks = marksMap[student._id.toString()] || {};

        studentData.push({
          studentId: student._id,
          studentName: student.studentName || `${student.firstName} ${student.lastName}`.trim(),
          prn: student.prn || student.rollNumber,
          teamId: team._id,
          teamName: team.name,
          marks: {
            _id: sMarks._id,
            proposalMarks: sMarks.proposalMarks !== null && sMarks.proposalMarks !== undefined ? sMarks.proposalMarks : '',
            pptMarks: sMarks.pptMarks !== null && sMarks.pptMarks !== undefined ? sMarks.pptMarks : '',
            prototypeMarks: sMarks.prototypeMarks !== null && sMarks.prototypeMarks !== undefined ? sMarks.prototypeMarks : '',
            reportMarks: sMarks.reportMarks !== null && sMarks.reportMarks !== undefined ? sMarks.reportMarks : '',
            totalMarks: sMarks.totalMarks || 0,
            isLocked: !!sMarks.isLocked,
          },
          status: {
            proposalSubmitted,
            pptSubmitted,
            prototypeSubmitted,
            reportSubmitted,
          }
        });
      });
    });

    res.json({
      success: true,
      data: studentData
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

// Save Marks (Bulk or Single)
export const saveStudentMarks = async (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates)) {
      throw new ApiError(400, 'Invalid data format. Expected an array of updates.');
    }

    const savedMarks = [];
    
    for (const update of updates) {
      const { studentId, teamId, proposalMarks, pptMarks, prototypeMarks, reportMarks, isLocked } = update;
      
      let marksDoc = await StudentMarks.findOne({ student: studentId });
      
      if (!marksDoc) {
        marksDoc = new StudentMarks({
          student: studentId,
          team: teamId,
        });
      }

      // Check if locked and requesting to edit (only admin can lock/unlock, which we assume this is since route is protected)
      if (marksDoc.isLocked && isLocked === undefined) {
         continue; // skip if locked and we aren't explicitly unlocking
      }

      if (proposalMarks !== undefined && proposalMarks !== '') marksDoc.proposalMarks = Number(proposalMarks);
      if (pptMarks !== undefined && pptMarks !== '') marksDoc.pptMarks = Number(pptMarks);
      if (prototypeMarks !== undefined && prototypeMarks !== '') marksDoc.prototypeMarks = Number(prototypeMarks);
      if (reportMarks !== undefined && reportMarks !== '') marksDoc.reportMarks = Number(reportMarks);
      
      if (isLocked !== undefined) {
        marksDoc.isLocked = isLocked;
      }

      marksDoc.evaluatedBy = req.user._id;
      await marksDoc.save();
      savedMarks.push(marksDoc);
    }

    res.json({
      success: true,
      message: 'Marks updated successfully',
      data: savedMarks
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};
