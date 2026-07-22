import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import LoadingScreen from '../components/ui/LoadingScreen.jsx';
import ProtectedRoute from '../components/guards/ProtectedRoute.jsx';
import PublicRoute from '../components/guards/PublicRoute.jsx';

const wrap = (Component) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component />
  </Suspense>
);

// Auth pages
const LoginPage = lazy(() => import('../pages/auth/Login.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));
const Unauthorized = lazy(() => import('../pages/Unauthorized.jsx'));

// Student pages
const StudentLayout = lazy(() => import('../layouts/StudentLayout.jsx'));
const StudentDashboard = lazy(() => import('../pages/student/Dashboard.jsx'));
const StudentProfile = lazy(() => import('../pages/student/Profile.jsx'));
const StudentSettings = lazy(() => import('../pages/student/Settings.jsx'));
const StudentNotifications = lazy(() => import('../pages/student/Notifications.jsx'));
const StudentTeam = lazy(() => import('../pages/student/Team.jsx'));
const StudentCreateTeam = lazy(() => import('../pages/student/CreateTeam.jsx'));
const StudentProgress = lazy(() => import('../pages/student/Progress.jsx'));

// Admin pages
const AdminLayout = lazy(() => import('../layouts/AdminLayout.jsx'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard.jsx'));
const AdminTeams = lazy(() => import('../pages/admin/Teams.jsx'));
const AdminStudents = lazy(() => import('../pages/admin/Students.jsx'));
const AdminProfile = lazy(() => import('../pages/admin/Profile.jsx'));
const AdminSettings = lazy(() => import('../pages/admin/Settings.jsx'));
const AdminNotifications = lazy(() => import('../pages/admin/Notifications.jsx'));
const AdminPendingReviews = lazy(() => import('../pages/admin/PendingReviews.jsx'));
const AdminReviewDetails = lazy(() => import('../pages/admin/ReviewDetails.jsx'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicRoute>{wrap(LoginPage)}</PublicRoute>,
  },
  {
    path: '/login',
    element: <PublicRoute>{wrap(LoginPage)}</PublicRoute>,
  },

  {
    path: '/unauthorized',
    element: wrap(Unauthorized),
  },
  {
    path: '/student',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        {wrap(StudentLayout)}
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: wrap(StudentDashboard) },
      { path: 'notifications', element: wrap(StudentNotifications) },
      { path: 'team', element: wrap(StudentTeam) },
      { path: 'team/create', element: wrap(StudentCreateTeam) },
      { path: 'progress', element: wrap(StudentProgress) },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        {wrap(AdminLayout)}
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: wrap(AdminDashboard) },
      { path: 'teams', element: wrap(AdminTeams) },
      { path: 'students', element: wrap(AdminStudents) },
      { path: 'profile', element: wrap(AdminProfile) },
      { path: 'settings', element: wrap(AdminSettings) },
      { path: 'notifications', element: wrap(AdminNotifications) },
      { path: 'pending', element: wrap(AdminPendingReviews) },
      { path: 'reviews/:id', element: wrap(AdminReviewDetails) },
    ],
  },
  {
    path: '*',
    element: wrap(NotFound),
  },
]);
