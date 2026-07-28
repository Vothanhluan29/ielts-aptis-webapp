import axiosClient from "../../../../../services/axiosClient";

const aptisWritingBankApi = {
  getBankGroups: () => {
    return axiosClient.get("/aptis/writing/admin/bank/groups");
  },

  getBankGroupById: (id) => {
    return axiosClient.get(`/aptis/writing/admin/bank/groups/${id}`);
  },

  createBankGroup: (data) => {
    return axiosClient.post("/aptis/writing/admin/bank/groups", data);
  },

  updateBankGroup: (id, data) => {
    return axiosClient.put(`/aptis/writing/admin/bank/groups/${id}`, data);
  },

  deleteBankGroup: (id) => {
    return axiosClient.delete(`/aptis/writing/admin/bank/groups/${id}`);
  },

  generateRandomTest: (config) => {
    return axiosClient.post("/aptis/writing/admin/bank/generate-test", config);
  }
};

export default aptisWritingBankApi;

