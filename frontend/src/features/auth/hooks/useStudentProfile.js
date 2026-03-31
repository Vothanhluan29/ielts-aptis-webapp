import { useState, useRef, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import authApi from '../api/authApi'; // Đảm bảo đường dẫn này đúng với dự án của bạn

export const useStudentProfile = () => {
  // 1. Lấy context từ MainLayout (nơi chứa state user gốc)
  const context = useOutletContext();
  const user = context?.user;
  const refreshUser = context?.refreshUser;

  // 2. Các states xử lý hiệu ứng loading
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isUpdatingTarget, setIsUpdatingTarget] = useState(false);

  const fileInputRef = useRef(null);

  // 3. Xử lý URL Avatar với cache busting
  // useMemo giúp URL chỉ tính toán lại khi user.avatar_url thay đổi
  const avatarUrl = useMemo(() => {
    if (!user?.avatar_url) return null;
    // Thêm timestamp để ép trình duyệt tải ảnh mới nhất từ server (không dùng ảnh cũ trong cache)
    return `${user.avatar_url}?t=${new Date().getTime()}`;
  }, [user?.avatar_url]);

  /* ===================== HANDLERS ===================== */

  // Cập nhật Target Band
  const handleUpdateTarget = async (newBand) => {
    setIsUpdatingTarget(true);
    const loadingToast = toast.loading('Đang cập nhật mục tiêu...');
    try {
      await authApi.updateTargetBand(Number(newBand));
      
      // Quan trọng: Phải await refreshUser để đảm bảo data mới đã về tới Context
      if (refreshUser) {
        await refreshUser();
      }
      
      toast.success('Đã cập nhật mục tiêu điểm số!', { id: loadingToast });
    } catch (error) {
      toast.error('Không thể cập nhật mục tiêu', { id: loadingToast }, error);
    } finally {
      setIsUpdatingTarget(false);
    }
  };

  // Cập nhật Avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra kích thước file (ví dụ < 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Kích thước ảnh phải nhỏ hơn 2MB');
    }

    setUploadingAvatar(true);
    const loadingToast = toast.loading('Đang tải ảnh lên...');
    try {
      await authApi.uploadAvatar(file);
      
      // Đồng bộ lại toàn bộ ứng dụng để Avatar mới hiện lên ở cả Header
      if (refreshUser) {
        await refreshUser(); 
      }
      
      toast.success('Cập nhật ảnh đại diện thành công', { id: loadingToast });
    } catch (error) {
      console.error('Upload avatar error:', error);
      toast.error('Lỗi khi upload ảnh', { id: loadingToast });
    } finally {
      setUploadingAvatar(false);
      // Reset input file để có thể chọn lại cùng 1 file nếu user muốn
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return {
    user,
    avatarUrl, // Trả về URL đã được xử lý cache
    isUpdatingTarget,
    uploadingAvatar,
    fileInputRef,
    handleUpdateTarget,
    handleAvatarChange
  };
};