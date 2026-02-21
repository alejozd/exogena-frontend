import api from "./api";

export const activacionesService = {
  getAll: () => api.get("/activaciones"),
  getById: (id) => api.get(`/activaciones/${id}`),
  delete: (id) => api.delete(`/activaciones/${id}`),
};
