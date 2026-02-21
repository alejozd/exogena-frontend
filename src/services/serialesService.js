import api from "./api";

export const serialesService = {
  getAll: () => api.get("/seriales"),
  getByCliente: (clienteId) => api.get(`/seriales/cliente/${clienteId}`),
  getById: (id) => api.get(`/seriales/${id}`),
  create: (data) => api.post("/seriales", data),
  update: (id, data) => api.put(`/seriales/${id}`, data),
  delete: (id) => api.delete(`/seriales/${id}`),
};
