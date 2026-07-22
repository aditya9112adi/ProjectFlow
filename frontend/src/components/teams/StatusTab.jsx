import React, { useState, useMemo } from 'react';
import { Users, Search, CheckCircle, Clock, FileText, MonitorPlay, CheckSquare, Download, Link as LinkIcon, Unlock } from 'lucide-react';
import * as XLSX from 'xlsx';
import { teamService } from '../../services/team.service.js';
import toast from 'react-hot-toast';

export const StatusTab = ({ progressData, fetchProgress, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Teams');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [unlockingTeamId, setUnlockingTeamId] = useState(null);

  const stats = progressData?.stats || {};
  const teams = progressData?.teams || [];

  const handleExportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(teams.map(t => ({
      'Team Name': t.name,
      'Members Count': t.members.length,
      'Current Stage': t.currentStage,
      'Proposal Submitted': t.proposal ? 'Yes' : 'No',
      'PPT Submitted': t.ppt ? 'Yes' : 'No',
      'Prototype Submitted': t.prototype ? 'Yes' : 'No',
      'Report Submitted': t.report ? 'Yes' : 'No',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Status");
    XLSX.writeFile(wb, "teams_status.csv", { bookType: 'csv' });
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(teams.map(t => ({
      'Team Name': t.name,
      'Members Count': t.members.length,
      'Current Stage': t.currentStage,
      'Proposal Submitted': t.proposal ? 'Yes' : 'No',
      'PPT Submitted': t.ppt ? 'Yes' : 'No',
      'Prototype Submitted': t.prototype ? 'Yes' : 'No',
      'Report Submitted': t.report ? 'Yes' : 'No',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Status");
    XLSX.writeFile(wb, "teams_status.xlsx");
  };

  const cards = [
    { title: 'Total Teams', count: stats.totalTeams || 0, icon: Users, color: 'from-blue-600 to-blue-400', filter: 'All Teams' },
    { title: 'Proposal Pending', count: stats.proposalPending || 0, icon: Clock, color: 'from-orange-600 to-orange-400', filter: 'Proposal Pending' },
    { title: 'Proposal Submitted', count: stats.proposalSubmitted || 0, icon: CheckCircle, color: 'from-emerald-600 to-emerald-400', filter: 'Proposal Submitted' },
    { title: 'PPT Pending', count: stats.pptPending || 0, icon: Clock, color: 'from-orange-600 to-orange-400', filter: 'PPT Pending' },
    { title: 'PPT Submitted', count: stats.pptSubmitted || 0, icon: MonitorPlay, color: 'from-emerald-600 to-emerald-400', filter: 'PPT Submitted' },
    { title: 'Prototype Pending', count: stats.prototypePending || 0, icon: Clock, color: 'from-orange-600 to-orange-400', filter: 'Prototype Pending' },
    { title: 'Prototype Submitted', count: stats.prototypeSubmitted || 0, icon: CheckSquare, color: 'from-emerald-600 to-emerald-400', filter: 'Prototype Submitted' },
    { title: 'Report Pending', count: stats.reportPending || 0, icon: Clock, color: 'from-orange-600 to-orange-400', filter: 'Report Pending' },
    { title: 'Report Submitted', count: stats.reportSubmitted || 0, icon: FileText, color: 'from-emerald-600 to-emerald-400', filter: 'Report Submitted' },
  ];

  const filterChips = ['All Teams', 'Proposal Pending', 'Proposal Submitted', 'PPT Pending', 'PPT Submitted', 'Prototype Pending', 'Prototype Submitted', 'Report Pending', 'Report Submitted', 'Completed'];

  const filteredTeams = useMemo(() => {
    let result = teams;

    // Apply Filter Tab
    if (activeFilter !== 'All Teams') {
      result = result.filter(t => {
        if (activeFilter === 'Proposal Pending') return !t.proposal;
        if (activeFilter === 'Proposal Submitted') return t.proposal;
        if (activeFilter === 'PPT Pending') return t.proposal && !t.ppt;
        if (activeFilter === 'PPT Submitted') return t.ppt;
        if (activeFilter === 'Prototype Pending') return t.ppt && !t.prototype;
        if (activeFilter === 'Prototype Submitted') return t.prototype;
        if (activeFilter === 'Report Pending') return t.prototype && !t.report;
        if (activeFilter === 'Report Submitted') return t.report;
        if (activeFilter === 'Completed') return t.currentStage === 'Completed';
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

    // Apply Sort
    result = [...result].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'members') {
        aVal = a.members.length;
        bVal = b.members.length;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [teams, activeFilter, searchQuery, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleUnlockTeam = async (teamId) => {
    try {
      setUnlockingTeamId(teamId);
      await teamService.approveEditAccess(teamId);
      toast.success('Team unlocked successfully');
      if (fetchProgress) {
        fetchProgress();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unlock team');
    } finally {
      setUnlockingTeamId(null);
    }
  };

  const currentData = filteredTeams.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(filteredTeams.length / rowsPerPage);

  if (isLoading) return <div className="text-center p-12 text-dark-400">Loading progress data...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div 
              key={card.title} 
              onClick={() => setActiveFilter(card.filter)}
              className={`bg-dark-900 border ${activeFilter === card.filter ? 'border-primary-500' : 'border-dark-800'} rounded-xl p-4 cursor-pointer hover:border-primary-500/50 transition-all hover:-translate-y-1`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-dark-300 text-xs font-semibold uppercase">{card.title}</h4>
              </div>
              <p className="text-2xl font-bold text-white">{card.count}</p>
            </div>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-dark-900 p-4 rounded-xl border border-dark-800">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            type="text"
            placeholder="Search by team or student name..."
            className="input pl-10 w-full bg-dark-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="btn-secondary gap-2 text-sm"><Download className="w-4 h-4" /> CSV</button>
          <button onClick={handleExportExcel} className="btn-secondary gap-2 text-sm"><Download className="w-4 h-4" /> Excel</button>
        </div>
      </div>

      {/* Filter Chips */}
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

      {/* Table */}
      <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-dark-800 bg-dark-900/50">
                <th onClick={() => requestSort('name')} className="p-4 text-xs font-semibold text-dark-400 uppercase cursor-pointer hover:text-white">Team Name</th>
                <th onClick={() => requestSort('members')} className="p-4 text-xs font-semibold text-dark-400 uppercase cursor-pointer hover:text-white">Members</th>
                <th className="p-4 text-xs font-semibold text-dark-400 uppercase text-center">Proposal</th>
                <th className="p-4 text-xs font-semibold text-dark-400 uppercase text-center">PPT</th>
                <th className="p-4 text-xs font-semibold text-dark-400 uppercase text-center">Prototype</th>
                <th className="p-4 text-xs font-semibold text-dark-400 uppercase text-center">Report</th>
                <th onClick={() => requestSort('currentStage')} className="p-4 text-xs font-semibold text-dark-400 uppercase cursor-pointer hover:text-white text-right">Current Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-dark-400">No Teams Found</td>
                </tr>
              ) : (
                currentData.map(team => (
                  <React.Fragment key={team._id}>
                    <tr 
                      className="hover:bg-dark-800/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedTeamId(expandedTeamId === team._id ? null : team._id)}
                    >
                      <td className="p-4 font-medium text-white flex items-center gap-2">
                        <div className={`transform transition-transform ${expandedTeamId === team._id ? 'rotate-180' : ''}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-dark-400"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        {team.name}
                      </td>
                      <td className="p-4 text-dark-300 text-sm">{team.members.length} Members</td>
                      <td className="p-4 text-center">{team.proposal ? <span className="text-emerald-500">✓</span> : <span className="text-dark-500">✗</span>}</td>
                      <td className="p-4 text-center">{team.ppt ? <span className="text-emerald-500">✓</span> : <span className="text-dark-500">✗</span>}</td>
                      <td className="p-4 text-center">{team.prototype ? <span className="text-emerald-500">✓</span> : <span className="text-dark-500">✗</span>}</td>
                      <td className="p-4 text-center">{team.report ? <span className="text-emerald-500">✓</span> : <span className="text-dark-500">✗</span>}</td>
                      <td className="p-4 text-right">
                        <span className="px-2 py-1 rounded text-[10px] font-semibold bg-dark-800 border border-dark-700 text-dark-300">
                          {team.currentStage}
                        </span>
                      </td>
                    </tr>
                    {expandedTeamId === team._id && (
                      <tr className="bg-dark-800/30 border-b border-dark-800">
                        <td colSpan="7" className="p-6">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Team Details</h3>
                            {team.isLocked && (
                              <button
                                onClick={() => handleUnlockTeam(team._id)}
                                disabled={unlockingTeamId === team._id}
                                className="btn-secondary text-xs px-4 py-2 flex items-center gap-2"
                              >
                                {unlockingTeamId === team._id ? (
                                  'Unlocking...'
                                ) : (
                                  <>
                                    <Unlock className="w-3.5 h-3.5" />
                                    Grant Edit Access
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          
                          {/* Members List */}
                          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {team.members.map((member, idx) => (
                              <div key={idx} className="bg-dark-900 border border-dark-700 p-3 rounded-lg flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                                  {member.user?.studentName?.charAt(0) || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-dark-100 text-sm font-medium truncate">
                                    {member.user?.studentName || 'Unknown Student'}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${member.role === 'leader' ? 'bg-amber-500/20 text-amber-500' : 'bg-dark-700 text-dark-300'}`}>
                                      {member.role}
                                    </span>
                                    {member.user?.prn && (
                                      <span className="text-dark-400 text-xs truncate">{member.user.prn.split('@')[0]}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {!team.project ? (
                            <div className="flex flex-col items-center justify-center py-4">
                              <p className="text-dark-400 text-sm">No project data found for this team.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* Proposal Data */}
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
                              
                              {/* PPT Submission */}
                              {team.project.pptId && (
                                <div className="bg-dark-900 border border-dark-700 p-4 rounded-xl">
                                  <h4 className="text-dark-400 text-xs font-semibold uppercase tracking-wider mb-3">PPT Submission</h4>
                                  <a href={team.project.pptId.driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-dark-900 flex flex-shrink-0 items-center justify-center"><LinkIcon className="w-5 h-5 text-primary-400" /></div>
                                    <div className="overflow-hidden"><p className="text-dark-100 font-medium truncate">Google Drive Presentation</p><p className="text-dark-400 text-xs mt-0.5 truncate">{team.project.pptId.driveLink}</p></div>
                                  </a>
                                </div>
                              )}

                              {/* Prototype Submission */}
                              {team.project.prototypeId && (
                                <div className="bg-dark-900 border border-dark-700 p-4 rounded-xl">
                                  <h4 className="text-dark-400 text-xs font-semibold uppercase tracking-wider mb-3">Prototype Submission</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {team.project.prototypeId.githubRepo && (
                                      <a href={team.project.prototypeId.githubRepo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-dark-900 flex flex-shrink-0 items-center justify-center"><LinkIcon className="w-5 h-5 text-primary-400" /></div>
                                        <div className="overflow-hidden"><p className="text-dark-100 font-medium truncate">Repository URL</p><p className="text-dark-400 text-xs mt-0.5 truncate">{team.project.prototypeId.githubRepo}</p></div>
                                      </a>
                                    )}
                                    {team.project.prototypeId.liveUrl && (
                                      <a href={team.project.prototypeId.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-dark-900 flex flex-shrink-0 items-center justify-center"><LinkIcon className="w-5 h-5 text-accent-400" /></div>
                                        <div className="overflow-hidden"><p className="text-dark-100 font-medium truncate">Live Demo URL</p><p className="text-dark-400 text-xs mt-0.5 truncate">{team.project.prototypeId.liveUrl}</p></div>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Report Submission */}
                              {team.project.reportId && (
                                <div className="bg-dark-900 border border-dark-700 p-4 rounded-xl">
                                  <h4 className="text-dark-400 text-xs font-semibold uppercase tracking-wider mb-3">Report Submission</h4>
                                  <a href={team.project.reportId.driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-dark-900 flex flex-shrink-0 items-center justify-center"><LinkIcon className="w-5 h-5 text-primary-400" /></div>
                                    <div className="overflow-hidden"><p className="text-dark-100 font-medium truncate">Google Drive Report</p><p className="text-dark-400 text-xs mt-0.5 truncate">{team.project.reportId.driveLink}</p></div>
                                  </a>
                                </div>
                              )}
                              
                              {/* Empty State */}
                              {!team.project.proposalId && !team.project.pptId && !team.project.prototypeId && !team.project.reportId && (
                                <p className="text-dark-400 text-sm text-center">No submissions have been made yet.</p>
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
        
        {/* Pagination */}
        <div className="p-4 border-t border-dark-800 flex justify-between items-center bg-dark-900/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-dark-400">Rows per page:</span>
            <select 
              value={rowsPerPage} 
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-dark-800 border border-dark-700 text-white text-xs rounded px-2 py-1"
            >
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-dark-400">Page {currentPage} of {totalPages || 1}</span>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                className="p-1 px-2 rounded bg-dark-800 text-dark-300 hover:bg-dark-700 disabled:opacity-50"
              >Prev</button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1 px-2 rounded bg-dark-800 text-dark-300 hover:bg-dark-700 disabled:opacity-50"
              >Next</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
