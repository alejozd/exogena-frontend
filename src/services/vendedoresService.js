import api from "./api";

export const vendedoresService = {
  getAll: () => api.get("/vendedores"),
  getById: (id) => api.get(`/vendedores/${id}`),
  create: (data) => api.post("/vendedores", data),
  update: (id, data) => api.put(`/vendedores/${id}`, data),
  delete: (id) => api.delete(`/vendedores/${id}`),
};
