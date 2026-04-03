import { useState, useRef, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { message } from 'antd';
import authApi from '../api/authApi'; 

export const useStudentProfile = () => {
  // 1. Get context from MainLayout (where the main user state is stored)
  const context = useOutletContext();
  const user = context?.user;
  const refreshUser = context?.refreshUser;

  // 2. States for loading effects and form handling
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  
  const [profileData, setProfileData] = useState({ full_name: '' });

  const fileInputRef = useRef(null);

  // Sync full name from user context when the page loads
  useEffect(() => {
    if (user?.full_name) {
      setProfileData({ full_name: user.full_name });
    }
  }, [user]);

  // 3. Avatar URL handling with cache busting
  const avatarUrl = useMemo(() => {
    if (!user?.avatar_url) return null;
    return `${user.avatar_url}?t=${new Date().getTime()}`;
  }, [user?.avatar_url]);

  /* ===================== HANDLERS ===================== */

  // Update avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return message.error('Image size must be smaller than 2MB');
    }

    setUploadingAvatar(true);
    const loadingMessage = message.loading('Uploading image...', 0);

    try {
      await authApi.uploadAvatar(file);
      
      if (refreshUser) {
        await refreshUser();
      }
      
      message.success('Avatar updated successfully');
    } catch (error) {
      console.error('Upload avatar error:', error);
      message.error('Error uploading image');
    } finally {
      loadingMessage();
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Update profile information (Full Name)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // Prevent request if nothing has changed
    if (profileData.full_name === user?.full_name) {
      return message.success('Profile information saved');
    }

    setSubmittingProfile(true);
    const loadingMessage = message.loading('Saving changes...', 0);
    
    try {
      // Ensure updateProfile function exists in authApi
      await authApi.updateProfile({ full_name: profileData.full_name });
      
      if (refreshUser) {
        await refreshUser();
      }
      
      message.success('Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMsg = error.response?.data?.detail || 'Error saving profile information';
      message.error(errorMsg);
    } finally {
      loadingMessage();
      setSubmittingProfile(false);
    }
  };

  return {
    user,
    avatarUrl,
    uploadingAvatar,
    submittingProfile,
    profileData,
    fileInputRef,
    setProfileData,
    handleAvatarChange,
    handleUpdateProfile
  };
};