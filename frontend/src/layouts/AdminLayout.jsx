import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BookOpen,
  FolderKanban,
  BarChart3,
  Award,
  Settings,
  Bell,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar.jsx';
import Topbar from '../components/layout/Topbar.jsx';

const adminNav = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/pending', label: 'Pending Requests', icon: ClipboardList },
  { path: '/admin/teams', label: 'Teams', icon: Users },
  { path: '/admin/students', label: 'Students', icon: BookOpen },
  { path: '/admin/marks', label: 'Marks', icon: Award },
  { path: '/admin/announcements', label: 'Announcements', icon: Bell },
];

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/pending': 'Pending Requests',
  '/admin/teams': 'Teams',
  '/admin/students': 'Students',
  '/admin/projects': 'Projects',
  '/admin/analytics': 'Analytics',
  '/admin/marks': 'Student Marks',
  '/admin/announcements': 'Announcements',
  '/admin/profile': 'My Profile',
  '/admin/settings': 'Settings',
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'ProjectFlow';

  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar
        navItems={adminNav}
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

export default AdminLayout;
