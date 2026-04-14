import api from "./api";

const billService = {
  createBill: (data) => api.post("/api/bills/", data),
  getBills: (params) => api.get("/api/bills/", { params }),
  getBillById: (id) => api.get(`/api/bills/${id}`),
  getAvailableYears: () => api.get("/api/bills/years"),
};

export default billService;
