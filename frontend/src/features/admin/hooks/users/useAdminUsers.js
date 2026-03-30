import { useState, useEffect, useCallback } from 'react';
import adminUserApi from '../../api/users/adminUserApi';
import toast from 'react-hot-toast';

export const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0); // Lưu tổng số bản ghi từ Backend
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 1. Fetch dữ liệu có phân trang
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const skip = (currentPage - 1) * pageSize;
      const response = await adminUserApi.getAllUsers(skip, pageSize);
      
      // Khớp với cấu trúc: { items: [...], total: 100, ... } từ Backend mới
      setUsers(response.items || []);
      setTotalUsers(response.total || 0);
    } catch (error) {
      console.error("Lỗi fetch users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 2. Cập nhật User (Role, Status)
  const handleUpdateUser = async (userId, updateData) => {
    const loadingToast = toast.loading('Đang xử lý...');
    try {
      await adminUserApi.updateUserByAdmin(userId, updateData);
      toast.success('Cập nhật thành công', { id: loadingToast });
      
      // Cập nhật state cục bộ để UI thay đổi ngay lập tức mà không cần reload
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, ...updateData } : u
      ));
    } catch (error) {
      toast.error('Cập nhật thất bại', { id: loadingToast }, error);
    }
  };

  // 3. Xóa User
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?')) return;
    
    const loadingToast = toast.loading('Đang xóa...');
    try {
      await adminUserApi.deleteUserByAdmin(userId);
      toast.success('Đã xóa người dùng', { id: loadingToast });
      
      // Nếu xóa bản ghi cuối cùng của trang, quay lại trang trước
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchUsers(); // Refresh để bù đắp bản ghi từ trang sau lên (nếu có)
      }
    } catch (error) {
      toast.error('Lỗi khi xóa người dùng', { id: loadingToast }, error);
    }
  };

  // Tính toán tổng số trang cho UI
  const totalPages = Math.ceil(totalUsers / pageSize);

  return { 
    users, 
    loading, 
    handleUpdateUser, 
    handleDeleteUser, 
    currentPage, 
    setCurrentPage,
    totalPages,
    totalUsers
  };
};