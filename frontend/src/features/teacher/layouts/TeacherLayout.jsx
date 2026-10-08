import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import TeacherSideBar from '../components/TeacherSideBar';
import TeacherHeader from '../components/TeacherHeader';
import { useTeacherLayout } from '../hooks/useTeacherLayout';
import authApi from '../../auth/api/authApi';
import { WorkspaceShell } from '../../../common-ui';

const TeacherLayout = () => {
  const layoutProps = useTeacherLayout();
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
    <WorkspaceShell
      sidebar={<TeacherSideBar layoutProps={layoutProps} />}
      header={<TeacherHeader />}
    >
      <div className="mx-auto w-full max-w-[1600px]"><Outlet /></div>
    </WorkspaceShell>
  );
};

export default TeacherLayout;
