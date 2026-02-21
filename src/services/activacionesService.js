import api from "./api";

export const activacionesService = {
  getAll: () => api.get("/activaciones"),
  delete: (id) => api.delete(`/activaciones/${id}`),
};
