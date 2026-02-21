import api from "./api";

export const pagosService = {
  getAll: (ano) => api.get("/pagos", { params: { ano } }),
  getByVenta: (ventaId) => api.get(`/pagos/venta/${ventaId}`),
  create: (data) => api.post("/pagos", data),
};
