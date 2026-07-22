import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Trash2, ShieldAlert, Unlock, Clock, CheckCircle, Lock, Link as LinkIcon, FileText } from 'lucide-react';
import { teamService } from '../../services/team.service.js';
import toast from 'react-hot-toast';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [totalTeams, setTotalTeams] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const res = await teamService.getAllTeams({ limit: 100 });
      setTeams(res.data.data.teams);
      setTotalTeams(res.data.data.total);
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleDeleteClick = (team) => {
    setTeamToDelete(team);
  };

  const confirmDelete = async () => {
    if (!teamToDelete) return;
    try {
      setIsDeleting(true);
      await teamService.deleteTeam(teamToDelete._id);
      toast.success('Team deleted and students unassigned');
      setTeamToDelete(null);
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete team');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApproveEdit = async (teamId) => {
    try {
      await teamService.approveEditAccess(teamId);
      toast.success('Edit access approved');
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleAdminLock = async (teamId) => {
    try {
      await teamService.adminLockTeam(teamId);
      toast.success('Team locked successfully');
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to lock team');
    }
  };

  const filteredTeams = teams.filter(team => {
    const query = searchQuery.toLowerCase();
    const status = (team.project?.currentPhase || 'No Project').replace('_', ' ').toLowerCase();
    
    // Check basic fields
    if (team.name.toLowerCase().includes(query)) return true;
    if (team.projectDomain.toLowerCase().includes(query)) return true;
    if (status.includes(query)) return true;
    
    // Check members (names and PRNs)
    for (const member of team.members) {
      const name = (member.user.studentName || `${member.user.firstName || ''} ${member.user.lastName || ''}`).toLowerCase();
      const prn = (member.user.prn || member.user.rollNumber || '').toLowerCase();
      if (name.includes(query) || prn.includes(query)) return true;
    }
    
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Teams Management</h1>
          <p className="text-dark-400 text-sm mt-1">View all teams and manage access.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-600/20 text-primary-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Total Active Teams</p>
              <h3 className="text-3xl font-bold text-white">{totalTeams}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-dark-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-dark-800/50">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
            <input
              type="text"
              placeholder="Search by team, status, name, PRN..."
              className="input pl-10 w-full bg-dark-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-secondary gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-dark-800 bg-dark-900/50">
                <th className="p-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Team Details</th>
                <th className="p-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Project Domain</th>
                <th className="p-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Members</th>
                <th className="p-4 text-xs font-semibold text-dark-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-dark-400">Loading teams...</td>
                </tr>
              ) : filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-dark-400">
                    {searchQuery ? 'No teams match your search.' : 'No teams found.'}
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => (
                  <React.Fragment key={team._id}>
                    <tr className="hover:bg-dark-800/50 transition-colors">
                      <td className="p-4 cursor-pointer" onClick={() => setExpandedTeamId(expandedTeamId === team._id ? null : team._id)}>
                        <div className="flex items-center gap-2">
                          <div className={`transform transition-transform ${expandedTeamId === team._id ? 'rotate-180' : ''}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-dark-400"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{team.name}</span>
                            <span className="text-xs text-dark-500">ID: {team._id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-md bg-dark-800 text-dark-300 text-xs border border-dark-700">
                          {team.projectDomain}
                        </span>
                      </td>
                      <td className="p-4">
                        {(() => {
                          if (!team.project) {
                            return (
                              <span className="px-2 py-1 rounded-md bg-dark-800 text-dark-400 text-xs border border-dark-700">
                                No Project
                              </span>
                            );
                          }
                          
                          const phase = team.project.currentPhase;
                          const phaseData = team.project.phases?.[phase];
                          const isRejected = phaseData?.status === 'rejected';
                          const rejectionCount = phaseData?.reviews?.filter(r => r.action === 'rejected').length || 0;
                          
                          return (
                            <div className="flex flex-col items-start gap-1">
                              <span className={`px-2 py-1 rounded-md text-xs border capitalize ${
                                phase === 'completed' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-primary-500/10 text-primary-400 border-primary-500/20'
                              }`}>
                                {phase.replace('_', ' ')}
                              </span>
                              {isRejected && rejectionCount > 0 && (
                                <span className="text-[10px] text-red-400 font-semibold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                                  Rejected ({rejectionCount} {rejectionCount === 1 ? 'time' : 'times'})
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {team.members.map((member) => (
                            <div key={member.user._id} className="text-sm">
                              <span className="text-dark-200">
                                {member.user.studentName || `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim() || 'Unknown Student'}
                              </span>
                              <span className="text-dark-500 text-xs ml-2">({member.user.prn || member.user.rollNumber})</span>
                              {member.role === 'leader' && (
                                <span className="ml-2 text-[10px] uppercase font-bold text-accent-400">Leader</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-right flex justify-end items-center">
                        {!team.isLocked && (
                          <button
                            onClick={() => handleAdminLock(team._id)}
                            className="p-2 mr-2 rounded-lg text-amber-400 hover:bg-amber-400/10 transition-colors bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 px-3 text-xs font-semibold"
                            title="Lock Team"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            Lock
                          </button>
                        )}
                        {team.editRequestStatus === 'pending' && (
                          <button
                            onClick={() => handleApproveEdit(team._id)}
                            className="p-2 mr-2 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 px-3 text-xs font-semibold"
                            title="Approve Edit Request"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            Approve Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(team)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                          title="Delete Team"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    {expandedTeamId === team._id && (
                      <tr className="bg-dark-800/30">
                        <td colSpan="5" className="p-6 border-b border-dark-800">
                          {!team.project ? (
                            <div className="flex flex-col items-center justify-center py-6">
                              <p className="text-dark-400 text-sm">No project or proposal submitted yet by this team.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {team.project.proposalId && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-dark-900 border border-dark-700 p-5 rounded-xl">
                                  <div>
                                    <h4 className="text-dark-400 text-xs font-semibold uppercase tracking-wider mb-2">Problem Statement</h4>
                                    <p className="text-dark-200 text-sm leading-relaxed">{team.project.proposalId.problemStatement}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-dark-400 text-xs font-semibold uppercase tracking-wider mb-2">Proposed Solution</h4>
                                    <p className="text-dark-200 text-sm leading-relaxed">{team.project.proposalId.solution}</p>
                                  </div>
                                </div>
                              )}
                              
                              {team.project.pptId && (
                                <div className="bg-dark-900 border border-dark-700 p-4 rounded-xl">
                                  <h4 className="text-dark-400 text-xs font-semibold uppercase tracking-wider mb-3">PPT Submission</h4>
                                  <a href={team.project.pptId.driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-dark-900 flex flex-shrink-0 items-center justify-center"><LinkIcon className="w-5 h-5 text-primary-400" /></div>
                                    <div className="overflow-hidden"><p className="text-dark-100 font-medium truncate">Google Drive Presentation</p><p className="text-dark-400 text-xs mt-0.5 truncate">{team.project.pptId.driveLink}</p></div>
                                  </a>
                                </div>
                              )}

                              {team.project.prototypeId && (
                                <div className="bg-dark-900 border border-dark-700 p-4 rounded-xl">
                                  <h4 className="text-dark-400 text-xs font-semibold uppercase tracking-wider mb-3">Prototype Submission</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {team.project.prototypeId.githubRepo && (
                                      <a href={team.project.prototypeId.githubRepo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-dark-900 flex items-center justify-center"><LinkIcon className="w-5 h-5 text-primary-400" /></div>
                                        <div><p className="text-dark-100 font-medium">Repository URL</p><p className="text-dark-400 text-xs mt-0.5">{team.project.prototypeId.githubRepo}</p></div>
                                      </a>
                                    )}
                                    {team.project.prototypeId.liveUrl && (
                                      <a href={team.project.prototypeId.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-dark-900 flex items-center justify-center"><LinkIcon className="w-5 h-5 text-accent-400" /></div>
                                        <div><p className="text-dark-100 font-medium">Live Demo URL</p><p className="text-dark-400 text-xs mt-0.5">{team.project.prototypeId.liveUrl}</p></div>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )}

                              {team.project.reportId && (
                                <div className="bg-dark-900 border border-dark-700 p-4 rounded-xl">
                                  <h4 className="text-dark-400 text-xs font-semibold uppercase tracking-wider mb-3">Report Submission</h4>
                                  <a href={team.project.reportId.driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-dark-900 flex items-center justify-center"><LinkIcon className="w-5 h-5 text-primary-400" /></div>
                                    <div className="overflow-hidden"><p className="text-dark-100 font-medium truncate">Google Drive Report</p><p className="text-dark-400 text-xs mt-0.5 truncate">{team.project.reportId.driveLink}</p></div>
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {teamToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Team</h3>
              <p className="text-dark-400 text-sm mb-6">
                Are you sure you want to delete <strong className="text-white">{teamToDelete.name}</strong>? This action cannot be undone. All students in this team will be unassigned and free to join another team.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setTeamToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl transition-all disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Team'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
