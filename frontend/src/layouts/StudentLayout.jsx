import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Bell,
  User,
  Settings,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar.jsx';
import Topbar from '../components/layout/Topbar.jsx';

const studentNav = [
  { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/student/team', label: 'My Team', icon: Users },
  { path: '/student/progress', label: 'Progress', icon: FolderKanban },
  { path: '/student/notifications', label: 'Notifications', icon: Bell },
];

const pageTitles = {
  '/student/dashboard': 'Dashboard',
  '/student/team': 'My Team',
  '/student/progress': 'Progress',
  '/student/notifications': 'Notifications',
};

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'ProjectFlow';

  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar
        navItems={studentNav}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
      <main className="lg:ml-[260px] pt-16 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
