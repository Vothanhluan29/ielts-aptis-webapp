import axiosClient from '../../../../../services/axiosClient';

const aptisReadingBankApi = {
  createBankGroup: (data) => {
    return axiosClient.post('/aptis/reading/bank/groups', data);
  },
  
  getBankGroups: (params) => {
    return axiosClient.get('/aptis/reading/bank/groups', { params });
  },

  getBankGroupById: (id) => {
    return axiosClient.get(`/aptis/reading/bank/groups/${id}`);
  },

  updateBankGroup: (id, data) => {
    return axiosClient.put(`/aptis/reading/bank/groups/${id}`, data);
  },

  deleteBankGroup: (id) => {
    return axiosClient.delete(`/aptis/reading/bank/groups/${id}`);
  },

  generateTest: (data) => {
    return axiosClient.post('/aptis/reading/bank/generate', data);
  }
};

export default aptisReadingBankApi;
