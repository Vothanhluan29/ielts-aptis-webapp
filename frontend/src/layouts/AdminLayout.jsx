import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import SideBar from '../components/AdminLayout/SideBar';
import AptisSideBar from '../components/AdminLayout/AptisSideBar';
import Header from '../components/AdminLayout/Header';
import { useAdminLayout } from '../hooks/AdminLayout/useAdminLayout';
import authApi from '../features/auth/api/authApi';
import { FeedbackCountProvider } from '../contexts/FeedbackCountContext';
import { WorkspaceShell } from '../common-ui';

const AdminLayout = () => {

  const layoutProps = useAdminLayout();
  const location = useLocation();
  const navigate = useNavigate();

  const isAptis = location.pathname.includes('/aptis');

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const user = await authApi.getMe();
        const isTeacher = user.role && (user.role.toLowerCase() === 'teacher' || user.role.includes('TEACHER'));
        if (isTeacher) {
          navigate('/teacher/dashboard', { replace: true });
        }
      } catch (err) {
        console.error("Failed to check role in AdminLayout", err);
      }
    };
    checkAccess();
  }, [isAptis, navigate]);

  return (
    <FeedbackCountProvider>
      <WorkspaceShell
        sidebar={<AptisSideBar layoutProps={layoutProps} />}
        header={<Header />}
        className="bg-slate-100"
      >
        <div className="mx-auto w-full max-w-[1600px]"><Outlet /></div>
      </WorkspaceShell>
    </FeedbackCountProvider>
  );
};

export default AdminLayout;
