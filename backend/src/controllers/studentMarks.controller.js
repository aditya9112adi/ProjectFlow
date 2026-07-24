import { Team } from '../models/Team.model.js';
import { Project } from '../models/Project.model.js';
import { StudentMarks } from '../models/StudentMarks.model.js';
import { StudentData } from '../models/StudentData.model.js';
import { ApiError } from '../utils/ApiError.js';

// Get all student marks
export const getStudentMarks = async (req, res) => {
  try {
    // 1. Fetch ALL students, sorted by PRN
    const students = await StudentData.find({ role: 'student' }).sort({ prn: 1 });
    
    // 2. Fetch all teams (to map team names and projects)
    const teams = await Team.find({ isActive: true });
    const teamMap = {};
    teams.forEach(t => { teamMap[t._id.toString()] = t; });

    // 3. Fetch all projects
    const projects = await Project.find();
    const projectMap = {};
    projects.forEach(p => { projectMap[p.team.toString()] = p; });

    // 4. Fetch existing StudentMarks
    const marks = await StudentMarks.find();
    const marksMap = {};
    marks.forEach(m => { marksMap[m.student.toString()] = m; });

    const studentData = students.map(student => {
      const teamId = student.team;
      const team = teamId ? teamMap[teamId.toString()] : null;
      const project = teamId ? projectMap[teamId.toString()] : null;
      const phases = project?.phases || {};

      const proposalSubmitted = !!phases.proposal?.submittedAt;
      const pptSubmitted = !!phases.ppt?.submittedAt;
      const prototypeSubmitted = !!phases.prototypePhase?.submittedAt;
      const reportSubmitted = !!phases.report?.submittedAt;

      const sMarks = marksMap[student._id.toString()] || {};

      return {
        studentId: student._id,
        studentName: student.studentName || `${student.firstName} ${student.lastName}`.trim(),
        prn: student.prn || student.rollNumber,
        teamId: team ? team._id : null,
        teamName: team ? team.name : 'No Team',
        marks: {
          _id: sMarks._id,
          proposalMarks: sMarks.proposalMarks !== null && sMarks.proposalMarks !== undefined ? sMarks.proposalMarks : '',
          pptMarks: sMarks.pptMarks !== null && sMarks.pptMarks !== undefined ? sMarks.pptMarks : '',
          prototypeMarks: sMarks.prototypeMarks !== null && sMarks.prototypeMarks !== undefined ? sMarks.prototypeMarks : '',
          reportMarks: sMarks.reportMarks !== null && sMarks.reportMarks !== undefined ? sMarks.reportMarks : '',
          presentationMarks: sMarks.presentationMarks !== null && sMarks.presentationMarks !== undefined ? sMarks.presentationMarks : '',
          totalMarks: sMarks.totalMarks || 0,
          isLocked: !!sMarks.isLocked,
        },
        status: {
          proposalSubmitted,
          pptSubmitted,
          prototypeSubmitted,
          reportSubmitted,
        }
      };
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
      const { studentId, teamId, proposalMarks, pptMarks, prototypeMarks, reportMarks, presentationMarks, isLocked } = update;
      
      let marksDoc = await StudentMarks.findOne({ student: studentId });
      
      if (!marksDoc) {
        marksDoc = new StudentMarks({
          student: studentId,
          team: teamId || null,
        });
      } else if (teamId && marksDoc.team?.toString() !== teamId.toString()) {
        marksDoc.team = teamId; // update team if they joined one
      }

      // Check if locked and requesting to edit (only admin can lock/unlock, which we assume this is since route is protected)
      if (marksDoc.isLocked && isLocked === undefined) {
         continue; // skip if locked and we aren't explicitly unlocking
      }

      if (proposalMarks !== undefined) marksDoc.proposalMarks = proposalMarks === '' ? null : Number(proposalMarks);
      if (pptMarks !== undefined) marksDoc.pptMarks = pptMarks === '' ? null : Number(pptMarks);
      if (prototypeMarks !== undefined) marksDoc.prototypeMarks = prototypeMarks === '' ? null : Number(prototypeMarks);
      if (reportMarks !== undefined) marksDoc.reportMarks = reportMarks === '' ? null : Number(reportMarks);
      if (presentationMarks !== undefined) marksDoc.presentationMarks = presentationMarks === '' ? null : Number(presentationMarks);
      
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
