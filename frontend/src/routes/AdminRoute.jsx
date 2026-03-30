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
    return <div className="h-screen flex items-center justify-center">Checking permission....</div>;
  }

  // Nếu là admin -> Cho phép đi tiếp vào Outlet (AdminLayout)
  // Nếu không -> Đá về dashboard học viên
  return role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;