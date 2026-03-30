import { useState, useEffect } from 'react';
import profileApi from '../../api/profile/profileApi';
import { toast } from 'react-hot-toast'; 

export const useAdminProfile = () => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchAdminData = async () => {
        try {
            const data = await profileApi.getMe();
            setAdmin(data);
        } catch (err) {
            toast.error("Không thể tải thông tin hồ sơ", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateInfo = async (values) => {
        setUpdating(true);
        try {
            const updated = await profileApi.updateProfile(values);
            setAdmin(updated);
            toast.success("Cập nhật thông tin thành công!");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Cập nhật thất bại");
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
            toast.success("Đã cập nhật ảnh đại diện");
        } catch (err) {
            toast.error("Lỗi tải ảnh lên", err);
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    return { admin, loading, updating, handleUpdateInfo, handleAvatarChange, refresh: fetchAdminData };
};