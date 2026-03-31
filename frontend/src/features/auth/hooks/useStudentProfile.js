import { useState, useRef, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import authApi from '../api/authApi'; 

export const useStudentProfile = () => {
  // 1. Lấy context từ MainLayout (nơi chứa state user gốc)
  const context = useOutletContext();
  const user = context?.user;
  const refreshUser = context?.refreshUser;

  // 2. Các states xử lý hiệu ứng loading và form
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isUpdatingTarget, setIsUpdatingTarget] = useState(false);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  
  const [profileData, setProfileData] = useState({ full_name: '' });

  const fileInputRef = useRef(null);

  // Đồng bộ tên từ user context vào form khi trang vừa load xong
  useEffect(() => {
    if (user?.full_name) {
      setProfileData({ full_name: user.full_name });
    }
  }, [user]);

  // 3. Xử lý URL Avatar với cache busting
  const avatarUrl = useMemo(() => {
    if (!user?.avatar_url) return null;
    return `${user.avatar_url}?t=${new Date().getTime()}`;
  }, [user?.avatar_url]);

  /* ===================== HANDLERS ===================== */

  // Cập nhật Target Band
  const handleUpdateTarget = async (newBand) => {
    setIsUpdatingTarget(true);
    const loadingToast = toast.loading('Đang cập nhật mục tiêu...');
    try {
      await authApi.updateTargetBand(Number(newBand));
      
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

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Kích thước ảnh phải nhỏ hơn 2MB');
    }

    setUploadingAvatar(true);
    const loadingToast = toast.loading('Đang tải ảnh lên...');
    try {
      await authApi.uploadAvatar(file);
      
      if (refreshUser) {
        await refreshUser(); 
      }
      
      toast.success('Cập nhật ảnh đại diện thành công', { id: loadingToast });
    } catch (error) {
      console.error('Upload avatar error:', error);
      toast.error('Lỗi khi upload ảnh', { id: loadingToast });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Cập nhật Thông tin cá nhân (Full Name)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // Tránh gửi request nếu người dùng không thay đổi gì
    if (profileData.full_name === user?.full_name) {
      return toast.success('Đã lưu thông tin cá nhân!');
    }

    setSubmittingProfile(true);
    const loadingToast = toast.loading('Đang lưu thay đổi...');
    
    try {
      // Nhớ đảm bảo bạn đã tạo hàm updateProfile trong authApi
      await authApi.updateProfile({ full_name: profileData.full_name });
      
      if (refreshUser) {
        await refreshUser();
      }
      
      toast.success('Cập nhật thông tin thành công!', { id: loadingToast });
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMsg = error.response?.data?.detail || 'Lỗi khi lưu thông tin';
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setSubmittingProfile(false);
    }
  };

  return {
    user,
    avatarUrl,
    isUpdatingTarget,
    uploadingAvatar,
    submittingProfile,
    profileData,
    fileInputRef,
    setProfileData,
    handleUpdateTarget,
    handleAvatarChange,
    handleUpdateProfile
  };
};