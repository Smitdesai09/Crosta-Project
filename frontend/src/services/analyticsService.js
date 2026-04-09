import api from "./api";

const analyticsService = {
  getAnalytics: (params) => api.get("/api/analytics", { params }),
};

export default analyticsService;