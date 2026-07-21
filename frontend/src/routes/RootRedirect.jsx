import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import authApi from '../features/auth/api/authApi';

const RootRedirect = () => {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const user = await authApi.getMe();
        setRole(user.role);
      } catch (error) {
        setRole(null);
      } finally {
        setLoading(false);
      }
    };
    checkRole();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">
          Authenticating...
        </p>
      </div>
    );
  }

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  const roleLower = role.toLowerCase();
  
  if (roleLower === 'admin' || roleLower.includes('admin')) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  if (roleLower === 'teacher' || roleLower.includes('teacher')) {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  // default to aptis dashboard for students
  return <Navigate to="/aptis/dashboard" replace />;
};

export default RootRedirect;
