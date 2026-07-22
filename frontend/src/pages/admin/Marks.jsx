import React, { useState, useEffect } from 'react';
import { Search, Download, Lock, Unlock, Edit2, Save, X } from 'lucide-react';
import { teamMarksService } from '../../services/teamMarks.service.js';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton.jsx';
import ProcessingModal from '../../components/ui/ProcessingModal.jsx';

const Marks = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchStudent, setSearchStudent] = useState('');
  const [searchTeam, setSearchTeam] = useState('');
  const [minTotalMarks, setMinTotalMarks] = useState('');
  const [editingRows, setEditingRows] = useState({}); // { studentId: { proposalMarks, pptMarks, prototypeMarks, reportMarks, presentationMarks } }
  const [processing, setProcessing] = useState({ isOpen: false, status: 'loading', message: '' });

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    try {
      setIsLoading(true);
      const res = await teamMarksService.getStudentMarks();
      setStudents(res.data.data);
    } catch (err) {
      toast.error('Failed to load student marks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSheet = () => {
    // Generate CSV
    const headers = ['Student Name', 'PRN', 'Team Name', 'Proposal', 'PPT', 'Prototype', 'Report', 'Presentation', 'Total'];
    const csvRows = [];
    csvRows.push(headers.join(','));

    students.forEach(s => {
      const row = [
        `"${s.studentName}"`,
        `"${s.prn}"`,
        `"${s.teamName}"`,
        s.marks.proposalMarks || 0,
        s.marks.pptMarks || 0,
        s.marks.prototypeMarks || 0,
        s.marks.reportMarks || 0,
        s.marks.presentationMarks || 0,
        s.marks.totalMarks || 0
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_marks.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startEditing = (student) => {
    setEditingRows(prev => ({
      ...prev,
      [student.studentId]: {
        proposalMarks: student.marks.proposalMarks,
        pptMarks: student.marks.pptMarks,
        prototypeMarks: student.marks.prototypeMarks,
        reportMarks: student.marks.reportMarks,
        presentationMarks: student.marks.presentationMarks,
      }
    }));
  };

  const cancelEditing = (studentId) => {
    setEditingRows(prev => {
      const newState = { ...prev };
      delete newState[studentId];
      return newState;
    });
  };

  const handleInputChange = (studentId, field, value) => {
    let val = value === '' ? '' : Number(value);
    if (val !== '' && (val < 0 || val > 10)) return; // Restrict 0-10
    
    setEditingRows(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: val
      }
    }));
  };

  const handleSave = async (student) => {
    const editData = editingRows[student.studentId];
    if (!editData) return;

    setProcessing({ isOpen: true, status: 'loading', message: `Saving marks for ${student.studentName}...` });
    try {
      await teamMarksService.saveStudentMarks([{
        studentId: student.studentId,
        teamId: student.teamId,
        proposalMarks: editData.proposalMarks,
        pptMarks: editData.pptMarks,
        prototypeMarks: editData.prototypeMarks,
        reportMarks: editData.reportMarks,
        presentationMarks: editData.presentationMarks,
      }]);
      setProcessing({ isOpen: true, status: 'success', message: 'Marks saved successfully' });
      cancelEditing(student.studentId);
      await fetchMarks();
      setTimeout(() => setProcessing(prev => ({ ...prev, isOpen: false })), 2000);
    } catch (err) {
      setProcessing({ isOpen: true, status: 'error', message: 'Failed to save marks' });
      setTimeout(() => setProcessing(prev => ({ ...prev, isOpen: false })), 3000);
    }
  };

  const handleToggleLock = async (student) => {
    setProcessing({ isOpen: true, status: 'loading', message: student.marks.isLocked ? 'Unlocking marks...' : 'Locking marks...' });
    try {
      await teamMarksService.saveStudentMarks([{
        studentId: student.studentId,
        teamId: student.teamId,
        isLocked: !student.marks.isLocked
      }]);
      setProcessing({ isOpen: true, status: 'success', message: student.marks.isLocked ? 'Marks unlocked' : 'Marks locked' });
      await fetchMarks();
      setTimeout(() => setProcessing(prev => ({ ...prev, isOpen: false })), 2000);
    } catch (err) {
      setProcessing({ isOpen: true, status: 'error', message: 'Failed to toggle lock status' });
      setTimeout(() => setProcessing(prev => ({ ...prev, isOpen: false })), 3000);
    }
  };

  // Filtering
  const filteredStudents = students.filter(s => {
    const matchStudent = s.studentName.toLowerCase().includes(searchStudent.toLowerCase()) || 
                         (s.prn && s.prn.toLowerCase().includes(searchStudent.toLowerCase()));
    const matchTeam = s.teamName.toLowerCase().includes(searchTeam.toLowerCase());
    
    const total = s.marks.totalMarks || 0;
    const matchMarks = minTotalMarks === '' || total >= Number(minTotalMarks);

    return matchStudent && matchTeam && matchMarks;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Student Marks Dashboard</h1>
          <p className="text-dark-400 text-sm mt-1">Manage individual evaluations and scores for all students.</p>
        </div>
        <Button onClick={handleDownloadSheet} icon={Download}>
          Download Sheet
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-dark-900 p-4 rounded-xl border border-dark-800">
        <Input
          placeholder="Filter by Student or PRN..."
          icon={Search}
          value={searchStudent}
          onChange={(e) => setSearchStudent(e.target.value)}
        />
        <Input
          placeholder="Filter by Team Name..."
          icon={Search}
          value={searchTeam}
          onChange={(e) => setSearchTeam(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Min Total Marks..."
          value={minTotalMarks}
          onChange={(e) => setMinTotalMarks(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-dark-300">
            <thead className="bg-dark-950 text-dark-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Student & PRN</th>
                <th className="px-6 py-4 font-semibold">Team Name</th>
                <th className="px-6 py-4 font-semibold text-center">Proposal<br/><span className="text-xs text-dark-400">(Max 10)</span></th>
                <th className="px-6 py-4 font-semibold text-center">PPT<br/><span className="text-xs text-dark-400">(Max 10)</span></th>
                <th className="px-6 py-4 font-semibold text-center">Prototype<br/><span className="text-xs text-dark-400">(Max 10)</span></th>
                <th className="px-6 py-4 font-semibold text-center">Report<br/><span className="text-xs text-dark-400">(Max 10)</span></th>
                <th className="px-6 py-4 font-semibold text-center">Presentation<br/><span className="text-xs text-dark-400">(Max 10)</span></th>
                <th className="px-6 py-4 font-semibold text-center">Total</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="8" className="px-6 py-4">
                      <LoadingSkeleton className="h-12 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-dark-400">
                    No students found matching filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isEditing = !!editingRows[student.studentId];
                  const editData = editingRows[student.studentId] || {};
                  const isSaving = savingRows[student.studentId];
                  const isLocked = student.marks.isLocked;

                  return (
                    <tr key={student.studentId} className="hover:bg-dark-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{student.studentName}</div>
                        <div className="text-xs text-dark-400">{student.prn || 'No PRN'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {student.teamId ? (
                          <Badge variant="info">{student.teamName}</Badge>
                        ) : (
                          <span className="text-dark-500 text-sm">No Team</span>
                        )}
                      </td>

                      {/* Marks Columns */}
                      {['proposal', 'ppt', 'prototype', 'report', 'presentation'].map((phase) => (
                        <td key={phase} className="px-2 py-4 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              max="10"
                              className="w-16 bg-dark-950 border border-dark-700 rounded-lg px-2 py-1 text-center text-white focus:border-primary-500 outline-none transition-colors"
                              value={editData[`${phase}Marks`] !== undefined ? editData[`${phase}Marks`] : ''}
                              onChange={(e) => handleInputChange(student.studentId, `${phase}Marks`, e.target.value)}
                            />
                          ) : (
                            <span className="font-medium text-white">
                              {student.marks[`${phase}Marks`] !== '' ? student.marks[`${phase}Marks`] : '-'}
                            </span>
                          )}
                        </td>
                      ))}

                      {/* Total */}
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-primary-400">{student.marks.totalMarks || 0}</span>
                        <span className="text-dark-500 text-xs ml-1">/ 50</span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => cancelEditing(student.studentId)}
                                className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSave(student)}
                                className="p-2 text-primary-400 hover:text-white hover:bg-primary-500 rounded-lg transition-colors"
                                title="Save"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              {!isLocked && (
                                <button
                                  onClick={() => startEditing(student)}
                                  className="p-2 text-dark-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg transition-colors"
                                  title="Edit Marks"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleToggleLock(student)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isLocked 
                                    ? 'text-danger-400 hover:bg-danger-400/10 hover:text-danger-300' 
                                    : 'text-dark-400 hover:text-white hover:bg-dark-700'
                                }`}
                                title={isLocked ? "Unlock Marks" : "Lock Marks"}
                              >
                                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ProcessingModal 
        isOpen={processing.isOpen}
        status={processing.status}
        message={processing.message}
      />
    </div>
  );
};

export default Marks;
