import api from "./api";

const authService = {
  login: (data) => api.post("/api/auth/login", data),
  logout: () => api.post("/api/auth/logout"),
  forgotPassword: (data) => api.post("/api/auth/forgot-password", data),
  resetPassword: (token, data) =>
    api.post(`/api/auth/reset-password/${token}`, data),
  getMe: () => api.get("/api/user/me"),
};

export default authService;
