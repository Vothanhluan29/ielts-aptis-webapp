import axiosClient from '../../../../services/axiosClient';

const profileApi = {
    // Lấy thông tin cá nhân (Admin/User dùng chung)
    getMe: () => {
        return axiosClient.get('/users/me');
    },

    // Cập nhật họ tên
    updateProfile: (data) => {
        return axiosClient.patch('/users/me', data);
    },

    // Cập nhật Avatar (Sử dụng FormData cho file)
    updateAvatar: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosClient.patch('/users/me/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    changePassword: (passwordData) => {
        return axiosClient.post('/users/me/password', passwordData);
    }
};

export default profileApi;