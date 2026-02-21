import api from "./api";

export const dashboardService = {
  getStats: (ano) => api.get(`/dashboard/stats`, { params: { ano } }),
};
