import axiosClient from "../../../../../services/axiosClient";

const aptisGrammarVocabBankApi = {
  getBankGroups: () => {
    return axiosClient.get("/aptis/grammar-vocab/bank/groups");
  },

  getBankGroupById: (id) => {
    return axiosClient.get(`/aptis/grammar-vocab/bank/groups/${id}`);
  },

  createBankGroup: (data) => {
    return axiosClient.post("/aptis/grammar-vocab/bank/groups", data);
  },

  updateBankGroup: (id, data) => {
    return axiosClient.put(`/aptis/grammar-vocab/bank/groups/${id}`, data);
  },

  deleteBankGroup: (id) => {
    return axiosClient.delete(`/aptis/grammar-vocab/bank/groups/${id}`);
  },

  generateRandomTest: (config) => {
    return axiosClient.post("/aptis/grammar-vocab/bank/generate-test", config);
  }
};

export default aptisGrammarVocabBankApi;
