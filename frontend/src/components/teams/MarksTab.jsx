import React, { useState, useMemo } from 'react';
import { Search, Save, Edit2, X, Download } from 'lucide-react';
import { teamMarksService } from '../../services/teamMarks.service.js';
import toast from 'react-hot-toast';

export const MarksTab = ({ marksData, fetchMarks, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Teams');
  const [editingRows, setEditingRows] = useState({});
  const [localMarks, setLocalMarks] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const filterChips = ['All Teams', 'Evaluated', 'Not Evaluated', 'Proposal Submitted', 'PPT Submitted', 'Prototype Submitted', 'Completed'];

  const filteredTeams = useMemo(() => {
    let result = marksData || [];

    // Apply Filter
    if (activeFilter !== 'All Teams') {
      result = result.filter(t => {
        if (activeFilter === 'Evaluated') return t.marks.evaluated;
        if (activeFilter === 'Not Evaluated') return !t.marks.evaluated;
        if (activeFilter === 'Proposal Submitted') return t.status.proposalSubmitted;
        if (activeFilter === 'PPT Submitted') return t.status.pptSubmitted;
        if (activeFilter === 'Prototype Submitted') return t.status.prototypeSubmitted;
        if (activeFilter === 'Completed') return t.status.completed;
        return true;
      });
    }

    // Apply Search
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(t => {
        const teamMatch = t.name.toLowerCase().includes(lowerQ);
        const memberMatch = t.members.some(m => m.user?.studentName?.toLowerCase().includes(lowerQ));
        return teamMatch || memberMatch;
      });
    }

    return result;
  }, [marksData, activeFilter, searchQuery]);

  const handleEdit = (team) => {
    setEditingRows({ ...editingRows, [team._id]: true });
    setLocalMarks({ 
      ...localMarks, 
      [team._id]: {
        proposalMarks: team.marks.proposalMarks,
        pptMarks: team.marks.pptMarks,
        prototypeMarks: team.marks.prototypeMarks,
        reportMarks: team.marks.reportMarks
      }
    });
  };

  const handleCancel = (teamId) => {
    const newEditing = { ...editingRows };
    delete newEditing[teamId];
    setEditingRows(newEditing);
    
    const newLocal = { ...localMarks };
    delete newLocal[teamId];
    setLocalMarks(newLocal);
  };

  const handleInputChange = (teamId, field, value, max) => {
    if (value === '') {
      setLocalMarks(prev => ({
        ...prev,
        [teamId]: { ...prev[teamId], [field]: '' }
      }));
      return;
    }

    // Prevent decimals, negatives, non-numbers
    if (!/^\d*$/.test(value)) return;

    let numValue = parseInt(value, 10);
    if (numValue > max) {
      toast.error(`Maximum allowed is ${max}`);
      numValue = max;
    }
    
    setLocalMarks(prev => ({
      ...prev,
      [teamId]: { ...prev[teamId], [field]: numValue }
    }));
  };

  const calculateTotal = (marksObj) => {
    if (!marksObj) return 0;
    const p = marksObj.proposalMarks === '' ? 0 : Number(marksObj.proposalMarks) || 0;
    const pt = marksObj.pptMarks === '' ? 0 : Number(marksObj.pptMarks) || 0;
    const pr = marksObj.prototypeMarks === '' ? 0 : Number(marksObj.prototypeMarks) || 0;
    const r = marksObj.reportMarks === '' ? 0 : Number(marksObj.reportMarks) || 0;
    return p + pt + pr + r;
  };

  const saveSingleRow = async (teamId) => {
    const marks = localMarks[teamId];
    if (!marks) return;

    try {
      setIsSaving(true);
      await teamMarksService.saveMarks([{
        teamId,
        proposalMarks: marks.proposalMarks,
        pptMarks: marks.pptMarks,
        prototypeMarks: marks.prototypeMarks,
        reportMarks: marks.reportMarks,
      }]);
      toast.success('Marks Updated Successfully');
      handleCancel(teamId);
      await fetchMarks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save marks');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkSave = async () => {
    const dirtyTeamIds = Object.keys(editingRows).filter(id => editingRows[id]);
    if (dirtyTeamIds.length === 0) return;

    const updates = dirtyTeamIds.map(teamId => ({
      teamId,
      proposalMarks: localMarks[teamId].proposalMarks,
      pptMarks: localMarks[teamId].pptMarks,
      prototypeMarks: localMarks[teamId].prototypeMarks,
      reportMarks: localMarks[teamId].reportMarks,
    }));

    try {
      setIsSaving(true);
      await teamMarksService.saveMarks(updates);
      toast.success('All Marks Saved Successfully');
      setEditingRows({});
      setLocalMarks({});
      await fetchMarks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to bulk save marks');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-center p-12 text-dark-400">Loading marks data...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-dark-900 p-4 rounded-xl border border-dark-800">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            type="text"
            placeholder="Search team, student..."
            className="input pl-10 w-full bg-dark-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          {Object.keys(editingRows).length > 0 && (
            <button 
              onClick={handleBulkSave} 
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm w-full lg:w-auto justify-center"
            >
              <Save className="w-4 h-4" /> Save All Changes
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterChips.map(chip => (
          <button 
            key={chip}
            onClick={() => setActiveFilter(chip)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeFilter === chip ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-300 hover:bg-dark-700'}`}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-dark-800 bg-dark-900/50">
                <th className="p-4 text-xs font-semibold text-dark-400 uppercase">Team Name</th>
                <th className="p-4 text-xs font-semibold text-dark-400 uppercase text-center w-24">Proposal (10)</th>
                <th className="p-4 text-xs font-semibold text-dark-400 uppercase text-center w-24">PPT (20)</th>
                <th className="p-4 text-xs font-semibold text-dark-400 uppercase text-center w-24">Prototype (30)</th>
                <th className="p-4 text-xs font-semibold text-dark-400 uppercase text-center w-24">Report (40)</th>
                <th className="p-4 text-xs font-semibold text-dark-400 uppercase text-center w-24">Total (100)</th>
                <th className="p-4 text-xs font-semibold text-dark-400 uppercase text-center">Status</th>
                <th className="p-4 text-xs font-semibold text-dark-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-dark-400">No Teams Found</td>
                </tr>
              ) : (
                filteredTeams.map(team => {
                  const isEditing = editingRows[team._id];
                  const currentMarks = isEditing ? localMarks[team._id] : team.marks;
                  const total = isEditing ? calculateTotal(currentMarks) : team.marks.totalMarks;

                  return (
                    <tr key={team._id} className="hover:bg-dark-800/50 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-white">{team.name}</div>
                        <div className="text-[10px] text-dark-400 mt-1 line-clamp-1 max-w-[150px]">
                          {team.members.map(m => m.user?.studentName).join(', ')}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-14 text-center bg-dark-800 border border-dark-600 rounded p-1 text-sm text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" 
                            value={currentMarks.proposalMarks !== null ? currentMarks.proposalMarks : ''} 
                            onChange={(e) => handleInputChange(team._id, 'proposalMarks', e.target.value, 10)}
                            disabled={!team.status.proposalSubmitted}
                            title={!team.status.proposalSubmitted ? "Proposal not yet submitted" : ""}
                          />
                        ) : (
                          <span className="font-medium text-dark-200">{team.marks.proposalMarks !== '' ? team.marks.proposalMarks : '-'}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-14 text-center bg-dark-800 border border-dark-600 rounded p-1 text-sm text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" 
                            value={currentMarks.pptMarks !== null ? currentMarks.pptMarks : ''} 
                            onChange={(e) => handleInputChange(team._id, 'pptMarks', e.target.value, 20)}
                            disabled={!team.status.pptSubmitted}
                            title={!team.status.pptSubmitted ? "PPT not yet submitted" : ""}
                          />
                        ) : (
                          <span className="font-medium text-dark-200">{team.marks.pptMarks !== '' ? team.marks.pptMarks : '-'}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-14 text-center bg-dark-800 border border-dark-600 rounded p-1 text-sm text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" 
                            value={currentMarks.prototypeMarks !== null ? currentMarks.prototypeMarks : ''} 
                            onChange={(e) => handleInputChange(team._id, 'prototypeMarks', e.target.value, 30)}
                            disabled={!team.status.prototypeSubmitted}
                            title={!team.status.prototypeSubmitted ? "Prototype not yet submitted" : ""}
                          />
                        ) : (
                          <span className="font-medium text-dark-200">{team.marks.prototypeMarks !== '' ? team.marks.prototypeMarks : '-'}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-14 text-center bg-dark-800 border border-dark-600 rounded p-1 text-sm text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" 
                            value={currentMarks.reportMarks !== null ? currentMarks.reportMarks : ''} 
                            onChange={(e) => handleInputChange(team._id, 'reportMarks', e.target.value, 40)}
                            disabled={!team.status.reportSubmitted}
                            title={!team.status.reportSubmitted ? "Report not yet submitted" : ""}
                          />
                        ) : (
                          <span className="font-medium text-dark-200">{team.marks.reportMarks !== '' ? team.marks.reportMarks : '-'}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-lg font-bold ${total > 0 ? 'text-primary-400' : 'text-dark-500'}`}>
                          {total}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {team.marks.evaluated ? (
                          <span className="px-2 py-1 rounded text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            Evaluated
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-[10px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            Not Evaluated
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveSingleRow(team._id)} disabled={isSaving} className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors" title="Save">
                              <Save className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleCancel(team._id)} disabled={isSaving} className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors" title="Cancel">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleEdit(team)} className="p-1.5 rounded bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white transition-colors" title="Edit Marks">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
