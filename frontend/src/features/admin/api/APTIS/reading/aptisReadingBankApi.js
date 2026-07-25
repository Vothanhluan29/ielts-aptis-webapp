import axiosClient from '../../../../../services/axiosClient';

const aptisReadingBankApi = {
  createBankGroup: (data) => {
    return axiosClient.post('/aptis/reading/bank/groups', data);
  },
  
  getBankGroups: (part_number = null) => {
    let url = '/aptis/reading/bank/groups';
    if (part_number) {
      url += `?part_number=${part_number}`;
    }
    return axiosClient.get(url);
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
