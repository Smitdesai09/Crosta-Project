import api from "./api";

const dashboardService = {
  getDashboardData: () => api.get("/api/dashboard/"),
};

export default dashboardService;