import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import authApi from '../features/auth/api/authApi';

const AdminRoute = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const user = await authApi.getMe();
        setRole(user.role); 
      } catch (error) {
        setRole(null, error);
      } finally {
        setLoading(false);
      }
    };
    checkRole();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="relative flex justify-center items-center">
          <div className="absolute animate-ping w-12 h-12 rounded-full bg-blue-400 opacity-75"></div>
          <div className="relative w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
        <h3 className="mt-6 text-lg font-semibold text-slate-700 dark:text-slate-200">
          Verifying Access
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Please wait while we check your permissions...
        </p>
      </div>
    );
  }

  const isAuthorized = role === 'admin' || role === 'teacher';

  return isAuthorized ? <Outlet /> : <Navigate to="/aptis/dashboard" replace />;
};

export default AdminRoute;