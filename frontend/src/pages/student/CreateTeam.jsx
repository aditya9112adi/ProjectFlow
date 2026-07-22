import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { teamService } from '../../services/team.service.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import ProcessingModal from '../../components/ui/ProcessingModal.jsx';

const getWordCount = (str) => (str ? str.trim().split(/\s+/).filter(Boolean).length : 0);

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

const schema = z.object({
  name: z.string().min(3, 'Team name must be at least 3 characters').max(50),
  projectDomain: z.string().min(2, 'Please enter a project domain').max(100),
  description: z.string().min(1, 'Description is required').refine((val) => getWordCount(val) >= 50, {
    message: 'Description must be at least 50 words',
  }),
  member1: z.string().min(1, 'Team Member 1 is required'),
  member2: z.string().min(1, 'Team Member 2 is required'),
  member3: z.string().optional(),
});

const MemberInput = ({ label, name, placeholder, register, error, watch, onSendInvite, invitationStatus }) => {
  const [studentName, setStudentName] = useState('');
  const [isLooking, setIsLooking] = useState(false);
  const prnValue = watch(name);

  useEffect(() => {
    const lookup = async () => {
      if (!prnValue || prnValue.length < 5) {
        setStudentName('');
        return;
      }
      setIsLooking(true);
      try {
        const res = await teamService.lookupStudent(prnValue.trim());
        const student = res.data.data;
        setStudentName(student.studentName || `${student.firstName || ''} ${student.lastName || ''}`.trim());
      } catch (err) {
        if (err.response?.status === 404) {
          setStudentName('Student not found');
        } else {
          setStudentName('Network Error / Server Restarting');
        }
      } finally {
        setIsLooking(false);
      }
    };

    const timeoutId = setTimeout(lookup, 600);
    return () => clearTimeout(timeoutId);
  }, [prnValue]);

  return (
    <div className="space-y-3 p-4 bg-dark-800/30 rounded-xl border border-dark-700/50">
      <Input 
        label={label} 
        placeholder={placeholder} 
        error={error} 
        {...register(name)} 
      />
      {(prnValue && prnValue.length >= 5) && (
        <div className="pl-4 border-l-2 border-dark-600 flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              label="Verified Student Name"
              value={isLooking ? 'Searching...' : studentName}
              disabled
              className={`bg-dark-900 ${studentName === 'Student not found' ? 'text-red-400 border-red-500/30 font-semibold' : 'text-emerald-400 border-emerald-500/30 font-semibold'}`}
            />
          </div>
          {studentName && studentName !== 'Student not found' && (
            <div className="flex items-end pb-1">
              {invitationStatus === 'accepted' ? (
                <div className="px-4 py-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-sm flex items-center gap-2 h-[42px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Accepted
                </div>
              ) : invitationStatus === 'pending' ? (
                <div className="px-4 py-2.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold text-sm flex items-center gap-2 h-[42px]">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span> Pending
                </div>
              ) : (
                <Button 
                  type="button" 
                  onClick={() => onSendInvite(prnValue)}
                  className="h-[42px]"
                  variant="secondary"
                >
                  Send Invite
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CreateTeam = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processing, setProcessing] = useState({ isOpen: false, status: 'loading', message: '' });

  const { register, handleSubmit, watch, getValues, trigger, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const [invitations, setInvitations] = useState([]);

  const fetchInvitations = async () => {
    try {
      const res = await teamService.getMyInvitations();
      setInvitations(res.data.data.outgoing || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvitations();
    // Poll for status updates every 5 seconds
    const interval = setInterval(fetchInvitations, 5000);
    return () => clearInterval(interval);
  }, []);

  const getInvitationStatus = (prn) => {
    if (!prn) return null;
    const formattedPrn = prn.includes('@') ? prn : `${prn}@sguk.ac.in`;
    const invite = invitations.find(i => i.invitee?.prn === formattedPrn);
    return invite ? invite.status : null;
  };

  const handleSendInvite = async (prn) => {
    const isValidFields = await trigger(['name', 'projectDomain', 'description']);
    if (!isValidFields) {
      toast.error('Please fill in Team Name, Domain, and Description first.');
      return;
    }
    
    const { name, projectDomain, description } = getValues();
    
    setProcessing({ isOpen: true, status: 'loading', message: `Sending invitation to ${prn}...` });
    try {
      await teamService.sendInvitation({ rollNumber: prn, teamName: name, projectDomain, description });
      setProcessing({ isOpen: true, status: 'success', message: `Invitation sent to ${prn}!` });
      fetchInvitations();
      setTimeout(() => setProcessing(prev => ({ ...prev, isOpen: false })), 2000);
    } catch (err) {
      setProcessing({ isOpen: true, status: 'error', message: err.response?.data?.message || 'Failed to send invitation' });
      setTimeout(() => setProcessing(prev => ({ ...prev, isOpen: false })), 3000);
    }
  };

  const descriptionText = watch('description') || '';
  const descriptionWords = getWordCount(descriptionText);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setProcessing({ isOpen: true, status: 'loading', message: 'Creating your team...' });
    try {
      // Gather roll numbers
      const memberRollNumbers = [data.member1, data.member2];
      if (data.member3) {
        memberRollNumbers.push(data.member3);
      }

      await teamService.createTeam({
        name: data.name,
        projectDomain: data.projectDomain,
        description: data.description,
        memberRollNumbers,
      });
      
      setProcessing({ isOpen: true, status: 'success', message: 'Team created successfully! 🎉' });
      setTimeout(() => {
        setProcessing(prev => ({ ...prev, isOpen: false }));
        navigate('/student/team');
      }, 1500);
    } catch (err) {
      setProcessing({ isOpen: true, status: 'error', message: err.response?.data?.message || 'Failed to create team' });
      setTimeout(() => setProcessing(prev => ({ ...prev, isOpen: false })), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/student/team')} className="btn-ghost px-3">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-dark-50 font-black text-2xl">Create New Team</h2>
          <p className="text-dark-500 text-sm">Set up your project team</p>
        </div>
      </div>

      <div className="card p-7">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-dark-100 font-bold text-lg border-b border-dark-800 pb-2">Team Details</h3>
            <Input 
              label="Team Name *" 
              placeholder="e.g. Innovators Group" 
              error={errors.name?.message} 
              {...register('name')} 
            />
            <div className="space-y-1.5">
              <label className="label">Project Domain *</label>
              <select
                className={`input bg-dark-900 border-dark-700 text-white ${errors.projectDomain ? 'border-red-500/50 focus:border-red-500/50' : 'focus:border-primary-500'}`}
                {...register('projectDomain')}
                defaultValue=""
              >
                <option value="" disabled className="text-dark-400">Choose</option>
                {PROJECT_DOMAINS.map(domain => (
                  <option key={domain} value={domain} className="bg-dark-900">{domain}</option>
                ))}
              </select>
              {errors.projectDomain && <p className="text-red-400 text-xs mt-1">{errors.projectDomain.message}</p>}
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="label">Description *</label>
                <span className={`text-xs ${descriptionWords < 50 ? 'text-red-400' : 'text-dark-500'}`}>
                  {descriptionWords} / 50 min words
                </span>
              </div>
              <textarea
                className={`input min-h-[100px] resize-y ${errors.description ? 'border-red-500/50' : ''}`}
                placeholder="Brief description of your team and project idea..."
                {...register('description')}
              />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-dark-100 font-bold text-lg border-b border-dark-800 pb-2 pt-4">Team Members</h3>
            <p className="text-dark-500 text-sm">
              Please enter the PRN Numbers for your team members. A team must have exactly 3 or 4 members (including you).
            </p>
            
            <Input 
              label="Team Leader (Name & PRN Number) *" 
              value={`${user?.firstName || ''} ${user?.lastName || ''} - ${user?.rollNumber || ''} (You)`}
              disabled
              className="bg-dark-800/50 text-dark-300"
            />
            
            <MemberInput 
              label="Team Member 1 (PRN Number) *" 
              name="member1"
              placeholder="e.g. 2021001" 
              error={errors.member1?.message} 
              register={register}
              watch={watch}
              onSendInvite={handleSendInvite}
              invitationStatus={getInvitationStatus(watch('member1'))}
            />
            
            <MemberInput 
              label="Team Member 2 (PRN Number) *" 
              name="member2"
              placeholder="e.g. 2021002" 
              error={errors.member2?.message} 
              register={register}
              watch={watch}
              onSendInvite={handleSendInvite}
              invitationStatus={getInvitationStatus(watch('member2'))}
            />
            
            <MemberInput 
              label="Team Member 3 (PRN Number) (Optional)" 
              name="member3"
              placeholder="e.g. 2021003" 
              error={errors.member3?.message} 
              register={register}
              watch={watch}
              onSendInvite={handleSendInvite}
              invitationStatus={getInvitationStatus(watch('member3'))}
            />
          </div>

          {/* Calculate if all entered members have accepted */}
          {(() => {
            const m1 = watch('member1');
            const m2 = watch('member2');
            const m3 = watch('member3');
            
            const isM1Accepted = m1 && getInvitationStatus(m1) === 'accepted';
            const isM2Accepted = m2 && getInvitationStatus(m2) === 'accepted';
            const isM3Accepted = !m3 || (m3 && getInvitationStatus(m3) === 'accepted'); // Optional
            
            const allAccepted = isM1Accepted && isM2Accepted && isM3Accepted;
            const canSubmit = isValid && allAccepted;

            return (
              <div className="pt-4">
                {!allAccepted && (
                  <p className="text-orange-400 text-sm mb-4 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                    You must send invitations to all team members and wait for them to accept before you can create the team.
                  </p>
                )}
                <Button 
                  type="submit" 
                  className={`w-full transition-all duration-300 ${!canSubmit ? 'opacity-50 blur-[1px] pointer-events-none' : ''}`} 
                  size="lg" 
                  isLoading={isSubmitting} 
                  icon={Users}
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? 'Creating Team...' : 'Create Team'}
                </Button>
              </div>
            );
          })()}
        </form>
      </div>

      <ProcessingModal 
        isOpen={processing.isOpen}
        status={processing.status}
        message={processing.message}
      />
    </div>
  );
};

export default CreateTeam;
