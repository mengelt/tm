import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import CustomerDashboard from './components/customer/CustomerDashboard';
import IntakeForm from './components/customer/IntakeForm';
import TeamDashboard from './components/team/TeamDashboard';
import StartReview from './components/review/StartReview';
import ViewReview from './components/review/ViewReview';
import RoleRedirect from './components/RoleRedirect';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <RoleRedirect /> },
      { path: 'customer', element: <CustomerDashboard /> },
      { path: 'customer/new', element: <IntakeForm /> },
      { path: 'customer/edit/:id', element: <IntakeForm /> },
      { path: 'team', element: <TeamDashboard /> },
      { path: 'team/review/:id', element: <StartReview /> },
      { path: 'team/review/:id/view', element: <ViewReview /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default router;
