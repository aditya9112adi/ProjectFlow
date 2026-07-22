import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FolderKanban, Clock, CheckCircle2, TrendingUp, ArrowRight, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { analyticsService } from '../../services/analytics.service.js';
import { projectService } from '../../services/project.service.js';
import StatCard from '../../components/ui/StatCard.jsx';
import { StatCardSkeleton } from '../../components/ui/LoadingSkeleton.jsx';
import Badge from '../../components/ui/Badge.jsx';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [analyticsRes, pendingRes] = await Promise.allSettled([
          analyticsService.getAdminAnalytics(),
          projectService.getPendingReviews(),
        ]);
        if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data.data);
        if (pendingRes.status === 'fulfilled') setPendingItems(pendingRes.value.data.data.items?.slice(0, 5) || []);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const phaseConfig = {
    proposal: { label: 'Proposal', color: 'badge-primary' },
    ppt: { label: 'PPT', color: 'badge-info' },
    report: { label: 'Report', color: 'badge-warning' },
    prototype: { label: 'Prototype', color: 'badge-success' },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-900/40 via-dark-900 to-primary-900/40 border border-accent-800/30 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10" style={{
          background: 'radial-gradient(circle, #d946ef 0%, transparent 70%)',
        }} />
        <div className="relative z-10">
          <p className="text-dark-400 text-sm font-medium mb-1">Admin Portal 👨‍🏫</p>
          <h2 className="text-dark-50 text-2xl md:text-3xl font-black mb-2">
            Welcome, {user?.firstName}!
          </h2>
          <p className="text-dark-400 text-sm max-w-md">
            {analytics?.totalPending > 0
              ? `You have ${analytics.totalPending} pending review${analytics.totalPending > 1 ? 's' : ''} awaiting your attention.`
              : 'All caught up! No pending reviews at the moment.'}
          </p>
          {analytics?.totalPending > 0 && (
            <Link to="/admin/pending" className="btn-primary mt-4 inline-flex">
              Review Now <ArrowRight className="w-4 h-4" />
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
            <StatCard title="Total Students" value={analytics?.totalStudents || 0} icon={Users} gradient="linear-gradient(135deg,#6366f1,#8b5cf6)" subtitle="Active registered students" />
            <StatCard title="Total Teams" value={analytics?.totalTeams || 0} icon={Users} gradient="linear-gradient(135deg,#0ea5e9,#6366f1)" subtitle="Project teams" />
            <StatCard title="Pending Reviews" value={analytics?.totalPending || 0} icon={ClipboardList} gradient="linear-gradient(135deg,#f59e0b,#d97706)" subtitle="Submissions waiting" />
            <StatCard title="Completion Rate" value={`${analytics?.completionRate || 0}%`} icon={TrendingUp} gradient="linear-gradient(135deg,#10b981,#059669)" subtitle="Projects fully completed" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Quick Stats */}
        <div className="card p-6">
          <h3 className="text-dark-100 font-bold text-base mb-6">Project Overview</h3>
          <div className="space-y-5">
            {[
              { label: 'In Progress', value: analytics?.inProgressProjects || 0, color: 'bg-primary-500', max: analytics?.totalProjects || 1 },
              { label: 'Completed', value: analytics?.completedProjects || 0, color: 'bg-emerald-500', max: analytics?.totalProjects || 1 },
              { label: 'Pending Reviews', value: analytics?.totalPending || 0, color: 'bg-amber-500', max: analytics?.totalTeams || 1 },
              { label: 'Rejected Proposals', value: analytics?.totalRejectedProposals || 0, color: 'bg-red-500', max: analytics?.totalProjects || 1 },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex justify-between mb-2">
                  <p className="text-dark-400 text-sm font-medium">{stat.label}</p>
                  <p className="text-dark-100 text-sm font-bold">{stat.value}</p>
                </div>
                <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stat.color} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min((stat.value / stat.max) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
