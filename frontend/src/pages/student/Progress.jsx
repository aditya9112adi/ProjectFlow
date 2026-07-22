import { useEffect, useState } from 'react';
import { Users, CheckCircle2, AlertCircle, Lock, Edit3, Send, Upload, FileText, File as FileIcon, X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { projectService } from '../../services/project.service.js';
import { teamService } from '../../services/team.service.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Badge from '../../components/ui/Badge.jsx';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import ProcessingModal from '../../components/ui/ProcessingModal.jsx';

const phasesList = [
  { id: 'proposal', label: 'Proposal Submission' },
  { id: 'ppt', label: 'PPT Submission' },
  { id: 'prototype', label: 'Prototype Submission' },
  { id: 'report', label: 'Project Report Submission' },
];

const PROJECT_DOMAINS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Web Development',
  'Mobile App Development',
  'IoT',
  'Cybersecurity',
  'Data Science',
  'Cloud Computing',
  'Blockchain',
  'Other'
];

const phaseLabels = {
  proposal: 'Proposal',
  ppt: 'PPT',
  prototype: 'Prototype',
  report: 'Project Report'
};

const Progress = () => {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePhase, setActivePhase] = useState('proposal');
  const [processing, setProcessing] = useState({ isOpen: false, status: 'loading', message: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const teamRes = await teamService.getMyTeam();
      setTeam(teamRes.data.data);
      
      try {
        const projectRes = await projectService.getMyProject();
        const proj = projectRes.data.data;
        setProject(proj);
        if (proj) {
          if (proj.phases?.proposal?.status !== 'approved') setActivePhase('proposal');
          else if (proj.phases?.ppt?.status !== 'approved') setActivePhase('ppt');
          else if (proj.phases?.prototype?.status !== 'approved') setActivePhase('prototype');
          else if (proj.phases?.report?.status !== 'approved') setActivePhase('report');
          else setActivePhase('completed');
        }
      } catch {
        setProject(null);
      }
    } catch {
      setTeam(null);
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  };

  const isLeader = team?.members?.some((m) => m.user._id === user?._id && m.role === 'leader');

  if (isLoading) return (
    <div className="max-w-5xl mx-auto space-y-6">
      <LoadingSkeleton count={3} height={20} />
    </div>
  );

  if (!team) return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-dark-50 font-black text-2xl">Progress</h2>
      </div>
      <div className="card">
        <EmptyState
          icon={Users}
          title="Join a team first"
          description="You need to be in a team before you can track progress."
          action={<Link to="/student/team" className="btn-primary">Go to Team</Link>}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-dark-50 font-black text-2xl">Progress Tracking</h2>
        <p className="text-dark-500 text-sm mt-1">Track your project through all approval stages</p>
      </div>

      <div className="relative border-l-2 border-dark-700 ml-4 space-y-8 pb-8">
        {phasesList.map((phase, index) => {
          const prevPhaseId = index > 0 ? phasesList[index - 1].id : null;
          const isPrevApproved = !prevPhaseId || project?.phases?.[prevPhaseId]?.status === 'approved';
          
          const status = project?.phases?.[phase.id]?.status || 'not_started';
          const isApproved = status === 'approved';
          const isSubmitted = status === 'submitted';
          const isRejected = status === 'rejected';
          const isLocked = !isPrevApproved;
          const rejectionCount = project?.phases?.[phase.id]?.reviews?.filter(r => r.action === 'rejected').length || 0;

          let Icon = Lock;
          let iconColor = 'bg-dark-800 text-dark-500 border-dark-700';
          
          if (isApproved) {
            Icon = CheckCircle2;
            iconColor = 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50';
          } else if (isRejected) {
            Icon = AlertCircle;
            iconColor = 'bg-red-500/20 text-red-500 border-red-500/50';
          } else if (isSubmitted) {
            Icon = FileText;
            iconColor = 'bg-red-500/20 text-red-500 border-red-500/50';
          } else if (!isLocked) {
            Icon = Edit3;
            iconColor = 'bg-dark-700 text-dark-200 border-dark-500';
          }

          return (
            <div key={phase.id} className="relative pl-8">
              {/* Timeline dot */}
              <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center ${iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className={`card p-6 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-dark-50">{phase.label}</h3>
                  </div>
                  {!isLocked && status !== 'not_started' && (
                    <Badge
                      variant={
                        isApproved ? 'success' :
                        isRejected ? 'error' :
                        isSubmitted ? 'error' : 'info'
                      }
                    >
                      {status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  )}
                </div>

                {isRejected && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-red-400 text-sm font-semibold">Rejected by Admin</p>
                      {rejectionCount > 0 && (
                        <span className="text-[10px] text-red-400 font-bold bg-red-500/20 px-1.5 py-0.5 rounded">
                          {rejectionCount} {rejectionCount === 1 ? 'Time' : 'Times'}
                        </span>
                      )}
                    </div>
                    <p className="text-dark-300 text-sm">
                      {project?.phases?.[phase.id]?.reviews?.[project.phases[phase.id].reviews.length - 1]?.comments || 'Please revise and resubmit.'}
                    </p>
                  </div>
                )}

                {isApproved && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                    <p className="text-emerald-400 text-sm font-semibold">Approved successfully.</p>
                  </div>
                )}

                {!isLocked && (
                  <PhaseForm 
                    phase={phase.id} 
                    project={project} 
                    isLeader={isLeader} 
                    onUpdate={fetchData} 
                    isApproved={isApproved}
                    isSubmitted={isSubmitted}
                    setProcessing={setProcessing}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <ProcessingModal 
        isOpen={processing.isOpen}
        status={processing.status}
        message={processing.message}
      />
    </div>
  );
};

const PhaseForm = ({ phase, project, isLeader, onUpdate, isApproved, isSubmitted, setProcessing }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: project?.title || '',
      domain: project?.domain || '',
      problemStatement: project?.proposalId?.problemStatement || '',
      solution: project?.proposalId?.solution || '',
      driveLink: project?.pptId?.driveLink || '',
      reportDriveLink: project?.reportId?.driveLink || '',
      githubRepo: project?.prototypeId?.githubRepo || '',
      liveUrl: project?.prototypeId?.liveUrl || '',
    },
  });

  const problemText = watch('problemStatement') || '';
  const solutionText = watch('solution') || '';
  
  const getWordCount = (str) => str.trim().split(/\s+/).filter(Boolean).length;
  
  const problemWords = getWordCount(problemText);
  const solutionWords = getWordCount(solutionText);

  const onSubmit = async (data) => {
    if (!isLeader) return toast.error('Only team leader can submit');

    setIsSubmitting(true);
    setProcessing({ isOpen: true, status: 'loading', message: 'Submitting your request...' });
    
    try {
      const formData = new FormData();
      if (phase === 'proposal') {
        formData.append('title', data.title);
        formData.append('domain', data.domain);
        formData.append('problemStatement', data.problemStatement);
        formData.append('solution', data.solution);
      } else if (phase === 'ppt') {
        formData.append('driveLink', data.driveLink);
      } else if (phase === 'prototype') {
        formData.append('githubRepo', data.githubRepo);
        formData.append('liveUrl', data.liveUrl);
      } else if (phase === 'report') {
        formData.append('driveLink', data.reportDriveLink);
      }

      await projectService.submitPhase(project?._id, phase, formData);
      setProcessing({ isOpen: true, status: 'success', message: `${phaseLabels[phase]} submitted successfully!` });
      onUpdate();
      setTimeout(() => setProcessing(prev => ({ ...prev, isOpen: false })), 2500);
    } catch (err) {
      setProcessing({ isOpen: true, status: 'error', message: err.response?.data?.message || `Failed to submit ${phaseLabels[phase]}` });
      setTimeout(() => setProcessing(prev => ({ ...prev, isOpen: false })), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLocked = isApproved || isSubmitted;
  const showForm = (!isApproved && !isSubmitted) && isLeader;

  if (!isLeader && !isApproved && !isSubmitted) {
    return (
      <div className="space-y-4 bg-dark-800/30 p-5 rounded-xl border border-dark-700 mt-4 text-center">
        <Lock className="w-8 h-8 text-dark-600 mx-auto mb-2" />
        <p className="text-dark-300 text-sm">
          Pending submission by your Team Leader. Only the Team Leader can submit the {phaseLabels[phase] || phase}.
        </p>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="space-y-4 bg-dark-800/30 p-5 rounded-xl border border-dark-700 mt-4">
        <div className="flex items-center gap-2 mb-2 pb-3 border-b border-dark-700/50">
          {isSubmitted && !isApproved && <Clock className="w-4 h-4 text-red-500" />}
          {isApproved && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span className={`font-semibold text-sm ${isApproved ? 'text-dark-200' : 'text-red-500'}`}>
            {isApproved ? 'Approved Submission' : 'Pending Admin Review'}
          </span>
        </div>
        
        {phase === 'proposal' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-dark-400 text-xs font-semibold mb-1 uppercase tracking-wider">Project Name</p>
              <p className="text-dark-100 text-sm font-medium">{project?.title || project?.projectTitle || 'N/A'}</p>
            </div>
            <div>
              <p className="text-dark-400 text-xs font-semibold mb-1 uppercase tracking-wider">Sector / Domain</p>
              <p className="text-dark-100 text-sm font-medium">{project?.domain || project?.proposalId?.domain || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-dark-400 text-xs font-semibold mb-1 uppercase tracking-wider">Problem Statement</p>
              <p className="text-dark-200 text-sm">{project?.proposalId?.problemStatement || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-dark-400 text-xs font-semibold mb-1 uppercase tracking-wider">Solution</p>
              <p className="text-dark-200 text-sm">{project?.proposalId?.solution || 'N/A'}</p>
            </div>
          </div>
        ) : phase === 'ppt' ? (
          <div>
            <p className="text-dark-400 text-xs font-semibold mb-1 uppercase tracking-wider">Google Drive Link</p>
            <a href={project?.pptId?.driveLink || '#'} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 text-sm break-all">
              {project?.pptId?.driveLink || 'N/A'}
            </a>
          </div>
        ) : phase === 'prototype' ? (
          <div className="space-y-4">
            <div>
              <p className="text-dark-400 text-xs font-semibold mb-1 uppercase tracking-wider">GitHub Repository</p>
              <a href={project?.prototypeId?.githubRepo || '#'} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 text-sm break-all">
                {project?.prototypeId?.githubRepo || 'N/A'}
              </a>
            </div>
            <div>
              <p className="text-dark-400 text-xs font-semibold mb-1 uppercase tracking-wider">Live URL</p>
              <a href={project?.prototypeId?.liveUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 text-sm break-all">
                {project?.prototypeId?.liveUrl || 'N/A'}
              </a>
            </div>
          </div>
        ) : phase === 'report' ? (
          <div>
            <p className="text-dark-400 text-xs font-semibold mb-1 uppercase tracking-wider">Report Google Drive Link</p>
            <a href={project?.reportId?.driveLink || '#'} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 text-sm break-all">
              {project?.reportId?.driveLink || 'N/A'}
            </a>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {phase === 'proposal' ? (
        <>
          <Input
            label="Project Name"
            placeholder="e.g. Smart Agriculture System"
            disabled={isLocked}
            error={errors.title?.message}
            {...register('title', { required: 'Project Name is required' })}
          />
          <div className="space-y-1.5">
            <label className="label">Sector / Domain</label>
            <select
              className={`input bg-dark-900 border-dark-700 text-white ${errors.domain ? 'border-red-500/50 focus:border-red-500/50' : 'focus:border-primary-500'}`}
              disabled={isLocked}
              {...register('domain', { required: 'Sector / Domain is required' })}
              defaultValue=""
            >
              <option value="" disabled className="text-dark-400">Choose</option>
              {PROJECT_DOMAINS.map(domain => (
                <option key={domain} value={domain} className="bg-dark-900">{domain}</option>
              ))}
            </select>
            {errors.domain && <p className="text-red-400 text-xs mt-1">{errors.domain.message}</p>}
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="label">Problem Statement</label>
              <span className={`text-xs ${problemWords > 200 ? 'text-warning-400' : 'text-dark-500'}`}>
                {problemWords} / 200 words
              </span>
            </div>
            <textarea
              className={`input min-h-[120px] py-3 resize-y ${problemWords > 200 ? 'border-warning-500 focus:border-warning-500 focus:ring-warning-500/20' : ''}`}
              placeholder="Describe the problem..."
              disabled={isLocked}
              {...register('problemStatement', { required: 'Problem statement is required' })}
            />
            {errors.problemStatement && <p className="text-red-400 text-xs">⚠ {errors.problemStatement.message}</p>}
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="label">Solution</label>
              <span className={`text-xs ${solutionWords > 200 ? 'text-warning-400' : 'text-dark-500'}`}>
                {solutionWords} / 200 words
              </span>
            </div>
            <textarea
              className={`input min-h-[120px] py-3 resize-y ${solutionWords > 200 ? 'border-warning-500 focus:border-warning-500 focus:ring-warning-500/20' : ''}`}
              placeholder="Describe your solution..."
              disabled={isLocked}
              {...register('solution', { required: 'Solution is required' })}
            />
            {errors.solution && <p className="text-red-400 text-xs">⚠ {errors.solution.message}</p>}
          </div>
        </>
      ) : phase === 'ppt' ? (
        <div className="space-y-4">
          <Input
            label="Google Drive Link"
            placeholder="Paste your Google Drive presentation link here..."
            disabled={isLocked}
            error={errors.driveLink?.message}
            {...register('driveLink', { 
              required: 'Google Drive link is required',
              pattern: {
                value: /^https?:\/\/(drive\.google\.com|docs\.google\.com)/,
                message: 'Please provide a valid Google Drive link'
              }
            })}
          />
          <p className="text-dark-500 text-xs mt-1">
            Ensure the link is set to "Anyone with the link can view".
          </p>
        </div>
      ) : phase === 'prototype' ? (
        <div className="space-y-4">
          <Input
            label="GitHub Repository Link"
            placeholder="e.g. https://github.com/username/repo"
            disabled={isLocked}
            error={errors.githubRepo?.message}
            {...register('githubRepo', { 
              required: 'GitHub link is required',
              pattern: { value: /^https?:\/\/(www\.)?github\.com/, message: 'Please provide a valid GitHub link' }
            })}
          />
          <Input
            label="Live / Published Link"
            placeholder="e.g. https://my-project.vercel.app"
            disabled={isLocked}
            error={errors.liveUrl?.message}
            {...register('liveUrl', { 
              required: 'Live URL is required',
              pattern: { value: /^https?:\/\//, message: 'Please provide a valid URL starting with http:// or https://' }
            })}
          />
        </div>
      ) : phase === 'report' ? (
        <div className="space-y-4">
          <Input
            label="Google Drive Link (Report)"
            placeholder="Paste your Google Drive report link here..."
            disabled={isLocked}
            error={errors.reportDriveLink?.message}
            {...register('reportDriveLink', { 
              required: 'Google Drive link is required',
              pattern: {
                value: /^https?:\/\/(drive\.google\.com|docs\.google\.com)/,
                message: 'Please provide a valid Google Drive link'
              }
            })}
          />
          <p className="text-dark-500 text-xs mt-1">
            Ensure the link is set to "Anyone with the link can view".
          </p>
        </div>
      ) : null}

      <div className="pt-4 flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !isLeader}
          isLoading={isSubmitting}
          icon={Send}
        >
          {isSubmitted ? 'Resubmit' : 'Submit'}
        </Button>
      </div>
    </form>
  );
};

export default Progress;
