import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ArrowRight, Clock, Link as LinkIcon } from 'lucide-react';
import { projectService } from '../../services/project.service.js';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton.jsx';
import { formatDistanceToNow } from '../../utils/formatters.js';

const PendingReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await projectService.getPendingReviews();
      setReviews(res.data.data?.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const counts = {
    all: reviews.length,
    proposal: reviews.filter(r => (r.phase || r.currentPhase) === 'proposal').length,
    ppt: reviews.filter(r => (r.phase || r.currentPhase) === 'ppt').length,
    prototype: reviews.filter(r => (r.phase || r.currentPhase) === 'prototype').length,
    report: reviews.filter(r => (r.phase || r.currentPhase) === 'report').length,
  };

  const filteredReviews = reviews.filter(r => 
    activeFilter === 'all' || (r.phase || r.currentPhase) === activeFilter
  );

  if (isLoading) return (
    <div className="max-w-6xl mx-auto space-y-6">
      <LoadingSkeleton count={4} height={100} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-dark-50 font-black text-2xl">Pending Reviews</h2>
          <p className="text-dark-500 text-sm mt-1">Projects awaiting your approval</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'proposal', 'ppt', 'prototype', 'report'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 border ${
                activeFilter === filter
                  ? 'bg-primary-600/10 text-primary-400 border-primary-500/50'
                  : 'bg-dark-800 text-dark-400 border-dark-700 hover:text-dark-200 hover:border-dark-600'
              }`}
            >
              <span className="capitalize">{filter}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeFilter === filter
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-700 text-dark-300'
              }`}>
                {counts[filter]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ClipboardList}
            title={reviews.length === 0 ? "All caught up!" : "No matches found"}
            description={reviews.length === 0 ? "There are no project submissions pending your review right now." : `No pending requests found for the selected phase.`}
          />
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredReviews.map((project) => {
            const activePhase = project.phase || project.currentPhase;
            const phaseData = project.phases?.[activePhase];

            const handleReview = async (status) => {
              let feedback = '';
              if (status === 'rejected') {
                feedback = window.prompt('Please provide a reason for rejection:');
                if (feedback === null) return;
                if (!feedback.trim()) {
                  alert('Rejection reason is required');
                  return;
                }
              }
              
              try {
                await projectService.reviewPhase(project.projectId || project._id, activePhase, { decision: status, feedback });
                alert(`Submission ${status} successfully`);
                fetchReviews();
              } catch (err) {
                alert(err.response?.data?.message || 'Failed to review submission');
              }
            };

            return (
              <div key={`${project.projectId}-${activePhase}`} className="card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="warning" className="capitalize">
                        {activePhase} Phase
                      </Badge>
                      <span className="text-dark-500 text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Submitted {project.submittedAt ? formatDistanceToNow(new Date(project.submittedAt)) : 'recently'}
                      </span>
                    </div>
                    <h3 className="text-dark-50 text-lg font-bold">{project.projectTitle || project.title}</h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-dark-400 text-sm font-semibold">Team: {project.teamName || project.team?.name}</p>
                      {project.members && project.members.length > 0 && (
                        <div className="pl-2 border-l-2 border-dark-700 mt-1 space-y-1">
                          {project.members.map((member) => (
                            <p key={member.user?._id || Math.random()} className="text-dark-300 text-xs flex items-center gap-1.5">
                              <span>{member.user?.studentName || `${member.user?.firstName || ''} ${member.user?.lastName || ''}`.trim() || 'Unknown'}</span>
                              <span className="text-dark-500">({member.user?.prn || member.user?.rollNumber})</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex gap-2">
                    <button onClick={() => handleReview('approved')} className="btn-primary bg-emerald-600 hover:bg-emerald-500 border-emerald-500">
                      Approve
                    </button>
                    <button onClick={() => handleReview('rejected')} className="btn-primary bg-red-600 hover:bg-red-500 border-red-500">
                      Reject
                    </button>
                    <Link
                      to={`/admin/reviews/${project.projectId || project._id}`}
                      className="btn-primary bg-dark-700 border-dark-600 hover:bg-dark-600"
                    >
                      Details
                    </Link>
                  </div>
                </div>

                {activePhase === 'proposal' && project.problemStatement && (
                  <div className="mt-4 pt-4 border-t border-dark-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-dark-800/30 p-4 rounded-xl border border-dark-700">
                      <p className="text-dark-300 text-xs font-semibold mb-2 uppercase tracking-wider">Problem Statement</p>
                      <p className="text-dark-100 text-sm line-clamp-3">{project.problemStatement}</p>
                    </div>
                    <div className="bg-dark-800/30 p-4 rounded-xl border border-dark-700">
                      <p className="text-dark-300 text-xs font-semibold mb-2 uppercase tracking-wider">Solution</p>
                      <p className="text-dark-100 text-sm line-clamp-3">{project.solution}</p>
                    </div>
                  </div>
                )}
                {activePhase === 'ppt' && project.pptId && (
                  <div className="mt-4 pt-4 border-t border-dark-800">
                    <a href={project.pptId.driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-dark-900 flex flex-shrink-0 items-center justify-center"><LinkIcon className="w-5 h-5 text-primary-400" /></div>
                      <div className="overflow-hidden"><p className="text-dark-100 font-medium truncate">Google Drive Presentation</p><p className="text-dark-400 text-xs mt-0.5 truncate">{project.pptId.driveLink}</p></div>
                    </a>
                  </div>
                )}
                {activePhase === 'prototype' && project.prototypeId && (
                  <div className="mt-4 pt-4 border-t border-dark-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.prototypeId.githubRepo && (
                      <a href={project.prototypeId.githubRepo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-dark-900 flex items-center justify-center"><LinkIcon className="w-5 h-5 text-primary-400" /></div>
                        <div><p className="text-dark-100 font-medium">Repository URL</p><p className="text-dark-400 text-xs mt-0.5">{project.prototypeId.githubRepo}</p></div>
                      </a>
                    )}
                    {project.prototypeId.liveUrl && (
                      <a href={project.prototypeId.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-dark-900 flex items-center justify-center"><LinkIcon className="w-5 h-5 text-accent-400" /></div>
                        <div><p className="text-dark-100 font-medium">Live Demo URL</p><p className="text-dark-400 text-xs mt-0.5">{project.prototypeId.liveUrl}</p></div>
                      </a>
                    )}
                  </div>
                )}
                {activePhase === 'report' && project.reportId && (
                  <div className="mt-4 pt-4 border-t border-dark-800">
                    <a href={project.reportId.driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-dark-900 flex flex-shrink-0 items-center justify-center"><LinkIcon className="w-5 h-5 text-primary-400" /></div>
                      <div className="overflow-hidden"><p className="text-dark-100 font-medium truncate">Google Drive Report</p><p className="text-dark-400 text-xs mt-0.5 truncate">{project.reportId.driveLink}</p></div>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingReviews;
