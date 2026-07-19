import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import SideBar from '../components/AdminLayout/SideBar';
import AptisSideBar from '../components/AdminLayout/AptisSideBar';
import Header from '../components/AdminLayout/Header';
import { useAdminLayout } from '../hooks/AdminLayout/useAdminLayout';
import authApi from '../features/auth/api/authApi';
import { FeedbackCountProvider } from '../contexts/FeedbackCountContext';

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
      <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900 overflow-hidden">

        {isAptis ? (
          <AptisSideBar layoutProps={layoutProps} />
        ) : (
          <SideBar layoutProps={layoutProps} />
        )}

        {/* MAIN VIEWPORT */}
        <div className="flex-1 flex flex-col overflow-hidden relative w-full">
          {/* HEADER Component */}
          <Header />

          {/* CONTENT AREA */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 lg:p-10 relative z-0 custom-scrollbar">
            <div className="w-full mx-auto max-w-[1600px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </FeedbackCountProvider>
  );
};

export default AdminLayout;