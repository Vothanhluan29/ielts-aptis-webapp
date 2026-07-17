import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AptisSideBar from '../components/AdminLayout/AptisSideBar';
import Header from '../components/AdminLayout/Header';
import { useAdminLayout } from '../hooks/AdminLayout/useAdminLayout';
import authApi from '../features/auth/api/authApi';

const TeacherLayout = () => {
  const layoutProps = useAdminLayout();
  const navigate = useNavigate();
  layoutProps.basePath = '/teacher';

  React.useEffect(() => {
    const checkAccess = async () => {
      try {
        const user = await authApi.getMe();
        const isAdmin = user.role && (user.role.toLowerCase() === 'admin' || user.role.includes('ADMIN'));
        if (isAdmin) {
          navigate('/admin/dashboard', { replace: true });
        }
      } catch (err) {
        console.error("Failed to check role in TeacherLayout", err);
      }
    };
    checkAccess();
  }, [navigate]);

  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900 overflow-hidden">

      {/* Teacher uses ONLY Aptis SideBar */}
      <AptisSideBar layoutProps={layoutProps} />

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
  );
};

export default TeacherLayout;
