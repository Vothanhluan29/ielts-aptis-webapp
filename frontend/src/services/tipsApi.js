import axiosClient from './axiosClient';

export const tipsApi = {
  // Public / Student endpoints
  getTipsList: (params) => axiosClient.get('/aptis/tips', { params }),
  getTipDetail: (tipId) => axiosClient.get(`/aptis/tips/${tipId}`),

  // Admin / Teacher endpoints
  adminGetTipsList: (params) => axiosClient.get('/aptis/tips/admin/all', { params }),
  adminCreateTip: (data) => axiosClient.post('/aptis/tips/admin', data),
  adminUpdateTip: (tipId, data) => axiosClient.put(`/aptis/tips/admin/${tipId}`, data),
  adminDeleteTip: (tipId) => axiosClient.delete(`/aptis/tips/admin/${tipId}`),
  adminUploadImage: (formData) =>
    axiosClient.post('/aptis/tips/admin/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

