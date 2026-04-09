import api from "./api";

const userService = {
  getUsers: () => api.get("/api/user"),
  createUser: (data) => api.post("/api/user", data),
  updateUser: (id, data) => api.put(`/api/user/${id}`, data),
  deleteUser: (id) => api.delete(`/api/user/${id}`),
  restoreUser: (id) => api.put(`/api/user/${id}/restore`),
};

export default userService;
