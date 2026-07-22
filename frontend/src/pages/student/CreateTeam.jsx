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

const getWordCount = (str) => (str ? str.trim().split(/\s+/).filter(Boolean).length : 0);

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

const MemberInput = ({ label, name, placeholder, register, error, watch }) => {
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
        setStudentName('Student not found');
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
        <div className="pl-4 border-l-2 border-dark-600">
          <Input
            label="Verified Student Name"
            value={isLooking ? 'Searching...' : studentName}
            disabled
            className={`bg-dark-900 ${studentName === 'Student not found' ? 'text-red-400 border-red-500/30 font-semibold' : 'text-emerald-400 border-emerald-500/30 font-semibold'}`}
          />
        </div>
      )}
    </div>
  );
};

const CreateTeam = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const descriptionText = watch('description') || '';
  const descriptionWords = getWordCount(descriptionText);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
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
      
      toast.success('Team created successfully! 🎉');
      navigate('/student/team');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create team');
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
            <Input 
              label="Project Domain *" 
              placeholder="e.g. Machine Learning, Web Development, IoT" 
              error={errors.projectDomain?.message} 
              {...register('projectDomain')} 
            />
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
            />
            
            <MemberInput 
              label="Team Member 2 (PRN Number) *" 
              name="member2"
              placeholder="e.g. 2021002" 
              error={errors.member2?.message} 
              register={register}
              watch={watch}
            />
            
            <MemberInput 
              label="Team Member 3 (PRN Number) (Optional)" 
              name="member3"
              placeholder="e.g. 2021003" 
              error={errors.member3?.message} 
              register={register}
              watch={watch}
            />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className={`w-full transition-all duration-300 ${!isValid ? 'opacity-50 blur-[1px] pointer-events-none' : ''}`} 
              size="lg" 
              isLoading={isSubmitting} 
              icon={Users}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Creating Team...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;
