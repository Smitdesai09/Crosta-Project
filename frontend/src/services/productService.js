import api from "./api";

const productService = {
  getAllProductsAdmin: () => api.get("/api/products/admin"),
  getProductStats: () => api.get("/api/products/stats"),
  getAvailableProducts: () => api.get("/api/products/"),
  createProduct: (data) => api.post("/api/products/", data),
  updateProduct: (id, data) => api.put(`/api/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/api/products/${id}`),
  restoreProduct: (id) => api.put(`/api/products/${id}/restore`),
};

export default productService;
