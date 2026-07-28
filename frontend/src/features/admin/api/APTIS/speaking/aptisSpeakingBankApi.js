import axiosClient from "../../../../../services/axiosClient";

const aptisSpeakingBankApi = {
  // Fetch all speaking bank groups
  getAllBankGroups: () => {
    return axiosClient.get("/admin/aptis/speaking/bank/");
  },

  // Get a single speaking bank group by ID
  getBankGroupById: (id) => {
    return axiosClient.get(`/admin/aptis/speaking/bank/${id}`);
  },

  // Create a new speaking bank group
  createBankGroup: (data) => {
    return axiosClient.post("/admin/aptis/speaking/bank/", data);
  },

  // Update an existing speaking bank group
  updateBankGroup: (id, data) => {
    return axiosClient.put(`/admin/aptis/speaking/bank/${id}`, data);
  },

  // Delete a speaking bank group
  deleteBankGroup: (id) => {
    return axiosClient.delete(`/admin/aptis/speaking/bank/${id}`);
  },

  // Generate a random test from bank groups
  generateRandomTest: (config) => {
    return axiosClient.post("/admin/aptis/speaking/bank/generate", config);
  },
};

export default aptisSpeakingBankApi;
