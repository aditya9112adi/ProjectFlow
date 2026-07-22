import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FolderKanban, Bell, TrendingUp, ArrowRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { projectService } from '../../services/project.service.js';
import { teamService } from '../../services/team.service.js';
import { notificationService } from '../../services/notification.service.js';
import StatCard from '../../components/ui/StatCard.jsx';
import { StatCardSkeleton } from '../../components/ui/LoadingSkeleton.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';

import toast from 'react-hot-toast';

const phaseLabels = { proposal: 'Proposal', ppt: 'PPT', report: 'Report', prototype: 'Prototype', completed: 'Completed' };

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ team: null, project: null, notifications: [], invitations: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [teamRes, projectRes, notifRes, invitesRes] = await Promise.allSettled([
          teamService.getMyTeam(),
          projectService.getMyProject(),
          notificationService.getNotifications({ limit: 5 }),
          teamService.getMyInvitations()
        ]);
        setData({
          team: teamRes.status === 'fulfilled' ? teamRes.value.data.data : null,
          project: projectRes.status === 'fulfilled' ? projectRes.value.data.data : null,
          notifications: notifRes.status === 'fulfilled' ? notifRes.value.data.data.notifications : [],
          invitations: invitesRes.status === 'fulfilled' ? (invitesRes.value.data.data.incoming || []) : [],
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const { team, project, notifications, invitations } = data;
  const currentPhase = project?.currentPhase || 'proposal';
  const progress = project?.progress || 0;

  const phaseStatus = project?.phases?.[currentPhase]?.status || 'not_started';
  const phaseStatusVariant = { approved: 'success', submitted: 'warning', rejected: 'error', not_started: 'info', under_review: 'info' };
  const proposalRejections = project?.phases?.proposal?.reviews?.filter(r => r.action === 'rejected').length || 0;

  const handleInvitationResponse = async (invitationId, action) => {
    try {
      await teamService.respondToInvitation(invitationId, action);
      if (action === 'accept') {
        window.location.reload(); // Reload to fetch the new team data
      } else {
        setData(prev => ({
          ...prev,
          invitations: prev.invitations.filter(inv => inv._id !== invitationId)
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred while responding');
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Pending Invitations Alert */}
      {!team && invitations.length > 0 && (
        <div className="space-y-4 mb-8">
          <h3 className="text-dark-100 font-bold text-lg">Team Invitations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invitations.map(inv => (
              <div key={inv._id} className="p-5 rounded-2xl bg-dark-800/80 border border-primary-500/30 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <p className="text-white font-semibold">{inv.teamName}</p>
                  <p className="text-dark-400 text-sm mt-1">Invited by: {inv.leader?.firstName} {inv.leader?.lastName}</p>
                  {inv.projectDomain && <Badge variant="info" className="mt-2 text-[10px]">{inv.projectDomain}</Badge>}
                </div>
                <div className="relative z-10 flex gap-2">
                  <button onClick={() => handleInvitationResponse(inv._id, 'accept')} className="btn-primary text-xs py-1.5 px-3">Join Team</button>
                  <button onClick={() => handleInvitationResponse(inv._id, 'reject')} className="bg-dark-700 hover:bg-dark-600 text-dark-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-900/60 via-dark-900 to-accent-900/40 border border-primary-800/30 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10" style={{
          background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
        }} />
        <div className="relative z-10">
          <p className="text-dark-400 text-sm font-medium mb-1">Good morning 👋</p>
          <h2 className="text-dark-50 text-2xl md:text-3xl font-black mb-2">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="text-dark-400 text-sm max-w-md">
            {!team ? 'Create or join a team to start your field project journey.' :
             !project ? 'Your team is ready. Submit your project proposal to begin.' :
             `Your project is ${progress}% complete. Keep up the great work!`}
          </p>
          {!team && (
            <Link to="/student/team" className="btn-primary mt-4 inline-flex">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Team Status"
              value={team ? team.members.length + ' Members' : 'No Team'}
              icon={Users}
              gradient="linear-gradient(135deg,#6366f1,#8b5cf6)"
              subtitle={team ? team.name : 'Create a team to start'}
            />
            <StatCard
              title="Current Phase"
              value={phaseLabels[currentPhase] || 'Proposal'}
              icon={FolderKanban}
              gradient="linear-gradient(135deg,#0ea5e9,#6366f1)"
              subtitle={project ? `Status: ${phaseStatus.replace('_', ' ')}${proposalRejections > 0 ? ` (${proposalRejections} Rejections)` : ''}` : 'Not started'}
            />
            <StatCard
              title="Progress"
              value={`${progress}%`}
              icon={TrendingUp}
              gradient="linear-gradient(135deg,#10b981,#059669)"
              subtitle="Overall project completion"
            />
            <StatCard
              title="Notifications"
              value={notifications.filter(n => !n.isRead).length}
              icon={Bell}
              gradient="linear-gradient(135deg,#f59e0b,#d97706)"
              subtitle="Unread messages"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Project Progress */}
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-dark-100 font-bold text-base">Project Timeline</h3>
            <Link to="/student/progress" className="text-primary-400 text-sm font-semibold hover:text-primary-300 flex items-center gap-1">
              View <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!project ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FolderKanban className="w-12 h-12 text-dark-700 mb-3" />
              <p className="text-dark-500 font-semibold">No project yet</p>
              <p className="text-dark-700 text-sm mt-1">
                {!team ? 'Join a team first' : 'Submit your proposal to begin'}
              </p>
              <Link to={team ? '/student/progress' : '/student/team'} className="btn-primary mt-4 text-sm">
                {team ? 'Submit Proposal' : 'Create Team'}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <ProgressBar value={progress} label="Overall progress" />
              <div className="grid grid-cols-2 gap-3">
                {['proposal', 'ppt', 'report', 'prototype'].map((phase) => {
                  const status = project?.phases?.[phase]?.status || 'not_started';
                  const icon = status === 'approved' ? CheckCircle2 : status === 'rejected' ? XCircle : Clock;
                  const Icon = icon;
                  return (
                    <div key={phase} className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 border border-dark-800">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${
                        status === 'approved' ? 'text-emerald-400' :
                        status === 'rejected' ? 'text-red-400' : 'text-dark-600'
                      }`} />
                      <div>
                        <p className="text-dark-200 text-xs font-semibold capitalize">{phaseLabels[phase]}</p>
                        <Badge variant={phaseStatusVariant[status] || 'info'} className="text-[10px] mt-0.5">
                          {status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-dark-100 font-bold text-base">Notifications</h3>
            <Link to="/student/notifications" className="text-primary-400 text-sm font-semibold hover:text-primary-300 flex items-center gap-1">
              All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="w-10 h-10 text-dark-700 mb-2" />
              <p className="text-dark-600 text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((n) => (
                <div key={n._id} className={`p-3 rounded-xl border transition-all ${
                  !n.isRead ? 'bg-primary-600/5 border-primary-600/20' : 'bg-dark-800/30 border-dark-800'
                }`}>
                  <p className="text-dark-200 text-xs font-semibold line-clamp-1">{n.title}</p>
                  <p className="text-dark-500 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                  {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
