import api from "./api";

const orderService = {
  getActiveOrders: () => api.get("/api/orders/active"),
  getOrderById: (id) => api.get(`/api/orders/${id}`),
  createOrder: (data) => api.post("/api/orders/", data),
  updateOrder: (id, data) => api.patch(`/api/orders/${id}`, data),
  cancelOrder: (id) => api.delete(`/api/orders/${id}/cancel`),
  createBill: (data) => api.post("/api/bills/", data),
  getProducts: () => api.get("/api/products/"),
  // Add these inside orderService
  getBills: (params) => api.get("/api/bills/", { params }),
  getBillById: (id) => api.get(`/api/bills/${id}`),
};

export default orderService;