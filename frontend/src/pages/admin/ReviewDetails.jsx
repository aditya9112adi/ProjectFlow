import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Link as LinkIcon, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectService } from '../../services/project.service.js';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

const ReviewDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await projectService.getProjectById(id);
      setProject(res.data.data);
    } catch (err) {
      toast.error('Failed to load project details');
      navigate('/admin/pending');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (status) => {
    if ((status === 'rejected' || status === 'returned') && !feedback.trim()) {
      return toast.error(`Feedback is required when ${status === 'returned' ? 'returning' : 'rejecting'} a submission`);
    }

    setIsSubmitting(true);
    try {
      await projectService.reviewPhase(id, project.currentPhase, {
        decision: status,
        feedback,
      });
      toast.success(`Submission ${status} successfully`);
      navigate('/admin/pending');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (!project) return null;

  const activePhase = project.currentPhase;
  const phaseData = project.phases?.[activePhase];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/pending')}
          className="w-10 h-10 rounded-xl bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-dark-50 font-black text-2xl">Review Submission</h2>
          <p className="text-dark-500 text-sm mt-1">Reviewing {activePhase} phase for {project.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-dark-100 font-bold text-lg mb-4">Project Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-dark-500 text-xs font-semibold uppercase tracking-wider mb-1">Title</p>
                <p className="text-dark-100 font-medium">{project.title}</p>
              </div>
              <div>
                <p className="text-dark-500 text-xs font-semibold uppercase tracking-wider mb-1">Department</p>
                <p className="text-dark-100 font-medium">{project.department}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {['proposal', 'ppt', 'prototype', 'report'].map((phase) => {
              const phaseObj = project.phases?.[phase];
              if (!phaseObj || phaseObj.status === 'not_started') return null;
              
              const isCurrentPhase = activePhase === phase;

              return (
                <div key={phase} className={`card p-6 ${isCurrentPhase ? 'border-primary-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'opacity-80'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-dark-100 font-bold text-lg capitalize">{phase} Submission</h3>
                    <Badge variant={phaseObj.status === 'approved' ? 'success' : phaseObj.status === 'rejected' ? 'error' : 'warning'}>
                      {phaseObj.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  {phase === 'proposal' && project.proposalId && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-dark-500 text-xs font-semibold uppercase tracking-wider mb-1">Sector / Domain</p>
                        <p className="text-dark-100 font-medium">{project.proposalId.domain}</p>
                      </div>
                      <div>
                        <p className="text-dark-500 text-xs font-semibold uppercase tracking-wider mb-1">Problem Statement</p>
                        <p className="text-dark-300 text-sm leading-relaxed whitespace-pre-wrap">{project.proposalId.problemStatement}</p>
                      </div>
                      <div>
                        <p className="text-dark-500 text-xs font-semibold uppercase tracking-wider mb-1">Solution</p>
                        <p className="text-dark-300 text-sm leading-relaxed whitespace-pre-wrap">{project.proposalId.solution}</p>
                      </div>
                    </div>
                  )}

                  {phase === 'ppt' && project.pptId && (
                    <div className="space-y-3 mt-4">
                      <a href={project.pptId.driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-dark-900 flex flex-shrink-0 items-center justify-center"><LinkIcon className="w-5 h-5 text-primary-400" /></div>
                        <div className="overflow-hidden"><p className="text-dark-100 font-medium truncate">Google Drive Presentation</p><p className="text-dark-400 text-xs mt-0.5 truncate">{project.pptId.driveLink}</p></div>
                      </a>
                    </div>
                  )}

                  {phase === 'prototype' && project.prototypeId && (
                    <div className="space-y-4 mt-4">
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

                  {phase === 'report' && project.reportId && (
                    <div className="space-y-3 mt-4">
                      <a href={project.reportId.driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-dark-900 flex items-center justify-center"><LinkIcon className="w-5 h-5 text-primary-400" /></div>
                        <div className="overflow-hidden"><p className="text-dark-100 font-medium truncate">Google Drive Report</p><p className="text-dark-400 text-xs mt-0.5 truncate">{project.reportId.driveLink}</p></div>
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-dark-100 font-bold text-lg mb-4">Team Info</h3>
            <p className="text-dark-200 font-medium mb-1">{project.team?.name}</p>
            <p className="text-dark-500 text-sm mb-4">{project.team?.department}</p>
            <div className="space-y-3">
              {project.team?.members?.map((m) => (
                <div key={m.user._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center text-xs font-bold text-primary-400">
                    {m.user.firstName?.[0]}{m.user.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-dark-200 text-sm font-medium">{m.user.firstName} {m.user.lastName}</p>
                    <p className="text-dark-600 text-xs capitalize">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-dark-100 font-bold text-lg mb-4">Submit Review</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="label">Feedback (Required for rejection or return)</label>
                <textarea
                  className="input min-h-[100px] py-3 resize-y"
                  placeholder="Provide constructive feedback..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleReview('returned')}
                  disabled={isSubmitting || !feedback.trim()}
                  isLoading={isSubmitting && feedback.trim() && !isSubmitting /* Hack for singular loading state */}
                  icon={ArrowLeft}
                  className="w-full text-amber-500 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/30"
                >
                  Return
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleReview('rejected')}
                  disabled={isSubmitting || !feedback.trim()}
                  isLoading={isSubmitting}
                  icon={XCircle}
                  className="w-full"
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleReview('approved')}
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  icon={CheckCircle}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                >
                  Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetails;
