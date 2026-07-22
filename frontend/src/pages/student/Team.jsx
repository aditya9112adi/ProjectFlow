import { useEffect, useState } from 'react';
import { Users, Plus, Crown, User, Trash2, UserPlus, FolderOpen, Hash, Lock, Unlock, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { teamService } from '../../services/team.service.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Modal from '../../components/ui/Modal.jsx';

const Team = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [rollNumberInput, setRollNumberInput] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLooking, setIsLooking] = useState(false);
  const [isRequestingEdit, setIsRequestingEdit] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const res = await teamService.getMyTeam();
      setTeam(res.data.data);
    } catch {
      setTeam(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLookup = async () => {
    if (!rollNumberInput.trim()) return;
    setIsLooking(true);
    setLookupResult(null);
    try {
      const res = await teamService.lookupStudent(rollNumberInput.trim());
      setLookupResult(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Student not found');
    } finally {
      setIsLooking(false);
    }
  };

  const handleAddMember = async () => {
    if (!lookupResult || !team) return;
    setIsAdding(true);
    try {
      const res = await teamService.addMember(team._id, rollNumberInput.trim());
      setTeam(res.data.data);
      setShowAddModal(false);
      setRollNumberInput('');
      setLookupResult(null);
      toast.success('Member added successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!confirm(`Remove ${memberName} from the team?`)) return;
    try {
      const res = await teamService.removeMember(team._id, memberId);
      setTeam(res.data.data);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const isLeader = team?.members?.some(
    (m) => m.user._id === user?._id && m.role === 'leader'
  );

  const handleRequestEdit = async () => {
    setIsRequestingEdit(true);
    try {
      const res = await teamService.requestEditAccess(team._id);
      setTeam(res.data.data);
      toast.success('Edit request sent to instructor');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request edit access');
    } finally {
      setIsRequestingEdit(false);
    }
  };

  const handleLockTeam = async () => {
    setIsLocking(true);
    try {
      const res = await teamService.lockTeam(team._id);
      setTeam(res.data.data);
      toast.success('Team locked successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to lock team');
    } finally {
      setIsLocking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <LoadingSkeleton type="block" count={4} height={16} />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-dark-50 font-black text-2xl">My Team</h2>
          <p className="text-dark-500 text-sm mt-1">Collaborate with your peers on field projects</p>
        </div>
        <div className="card">
          <EmptyState
            icon={Users}
            title="You're not in a team yet"
            description="Create a new team or ask a team leader to add you using your roll number."
            action={
              <Link to="/student/team/create" className="btn-primary gap-2">
                <Plus className="w-4 h-4" />
                Create New Team
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-dark-50 font-black text-2xl">My Team</h2>
          <p className="text-dark-500 text-sm mt-1">Manage your project team</p>
        </div>
        {isLeader && team.members.length < 4 && !team.isLocked && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
        )}
      </div>



      {/* Team Info Card */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-dark-50 text-xl font-black">{team.name}</h3>
            {team.projectDomain && (
              <p className="text-dark-400 text-sm mt-1">🎯 {team.projectDomain}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-800 border border-dark-700">
                <Hash className="w-3 h-3 text-primary-400" />
                <span className="text-dark-300 text-xs font-mono font-semibold">{team.teamCode}</span>
              </div>
              {team.department && <Badge variant="info">{team.department}</Badge>}
              {team.academicYear && <Badge variant="success">{team.academicYear}</Badge>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-dark-400 text-xs font-semibold uppercase tracking-wider">Members</p>
            <p className="text-3xl font-black text-dark-50">{team.members.length}<span className="text-dark-600 text-lg">/4</span></p>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-1.5">
            <span className="text-dark-500 text-xs">Team capacity</span>
            <span className="text-dark-400 text-xs font-semibold">{team.members.length}/4 members</span>
          </div>
          <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-500"
              style={{ width: `${(team.members.length / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Members list */}
        <div className="space-y-3">
          {team.members.map((member) => {
            const isMe = member.user._id === user?._id;
            const canRemove = isLeader && !isMe && member.role !== 'leader' && !team.isLocked;

            return (
              <div
                key={member.user._id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isMe
                    ? 'bg-primary-600/5 border-primary-600/20'
                    : 'bg-dark-800/50 border-dark-800'
                }`}
              >
                <Avatar
                  src={member.user.avatar}
                  name={`${member.user.firstName} ${member.user.lastName}`}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-dark-100 text-sm font-semibold">
                      {member.user.firstName} {member.user.lastName}
                      {isMe && <span className="text-dark-500 text-xs ml-1">(you)</span>}
                    </p>
                    {member.role === 'leader' && (
                      <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-dark-500 text-xs">{member.user.email}</p>
                    {member.user.rollNumber && (
                      <span className="text-dark-700 text-xs">• {member.user.rollNumber}</span>
                    )}
                  </div>
                </div>
                <Badge variant={member.role === 'leader' ? 'warning' : 'primary'}>
                  {member.role === 'leader' ? '👑 Leader' : 'Member'}
                </Badge>
                {canRemove && (
                  <button
                    onClick={() => handleRemoveMember(
                      member.user._id,
                      `${member.user.firstName} ${member.user.lastName}`
                    )}
                    className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setRollNumberInput(''); setLookupResult(null); }}
        title="Add Team Member"
      >
        <div className="space-y-4">
          <p className="text-dark-400 text-sm">Search for a student by their roll number to add them to your team.</p>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Enter roll number (e.g. CS2021002)"
              value={rollNumberInput}
              onChange={(e) => { setRollNumberInput(e.target.value); setLookupResult(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            />
            <button
              onClick={handleLookup}
              disabled={isLooking || !rollNumberInput.trim()}
              className="btn-secondary px-4"
            >
              {isLooking ? '...' : 'Find'}
            </button>
          </div>

          {lookupResult && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-800 border border-emerald-500/30 animate-fade-in">
              <Avatar
                src={lookupResult.avatar}
                name={`${lookupResult.firstName} ${lookupResult.lastName}`}
                size="md"
              />
              <div className="flex-1">
                <p className="text-dark-100 text-sm font-bold">{lookupResult.firstName} {lookupResult.lastName}</p>
                <p className="text-dark-500 text-xs">{lookupResult.email}</p>
                <p className="text-dark-600 text-xs mt-0.5">{lookupResult.department} • {lookupResult.academicYear}</p>
              </div>
              <Badge variant="success">Found</Badge>
            </div>
          )}

          {lookupResult && (
            <button
              onClick={handleAddMember}
              disabled={isAdding}
              className="btn-primary w-full gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {isAdding ? 'Adding...' : `Add ${lookupResult.firstName} to Team`}
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Team;
