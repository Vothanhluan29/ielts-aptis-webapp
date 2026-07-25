import axiosClient from '../../../../../services/axiosClient';

const aptisListeningBankApi = {
  getBankGroups: (params) => {
    return axiosClient.get('/aptis/listening/admin/bank/groups', { params });
  },
  getBankGroupById: (id) => {
    return axiosClient.get(`/aptis/listening/admin/bank/groups/${id}`);
  },
  createBankGroup: (data) => {
    return axiosClient.post('/aptis/listening/admin/bank/groups', data);
  },
  updateBankGroup: (id, data) => {
    return axiosClient.put(`/aptis/listening/admin/bank/groups/${id}`, data);
  },
  deleteBankGroup: (id) => {
    return axiosClient.delete(`/aptis/listening/admin/bank/groups/${id}`);
  },
  generateTest: (data) => {
    return axiosClient.post('/aptis/listening/admin/bank/generate-test', data);
  }
};

export default aptisListeningBankApi;
