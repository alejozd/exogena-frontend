import api from "./api";

export const ventasService = {
  getAll: (ano) => api.get("/ventas", { params: { ano } }),
  getById: (id) => api.get(`/ventas/${id}`),
  create: (data) => api.post("/ventas", data),
  update: (id, data) => api.put(`/ventas/${id}`, data),
  delete: (id) => api.delete(`/ventas/${id}`),
};
