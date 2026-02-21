import api from "./api";

export const generarClaveService = {
  generar: (serial) => api.post("/generar-clave", { serial }),
};
