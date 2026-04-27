import { useState, useEffect } from 'react';
import { message } from 'antd';
import profileApi from '../../api/profile/profileApi';

export const useAdminProfile = () => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchAdminData = async () => {
        try {
            const data = await profileApi.getMe();
            setAdmin(data);
        } catch {
            message.error("Unable to load profile information");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateInfo = async (values) => {
        setUpdating(true);
        try {
            const updated = await profileApi.updateProfile(values);
            setAdmin(updated);
            message.success("Profile updated successfully!");
        } catch (err) {
            message.error(err.response?.data?.detail || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const handleAvatarChange = async (file) => {
        if (!file) return;
        setUpdating(true);
        try {
            const updated = await profileApi.updateAvatar(file);
            setAdmin(updated);
            message.success("Avatar updated successfully");
        } catch {
            message.error("Failed to upload avatar");
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    return { admin, loading, updating, handleUpdateInfo, handleAvatarChange, refresh: fetchAdminData };
};