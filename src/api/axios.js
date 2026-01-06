import axios from "axios";

const api = axios.create({
  baseURL: "https://exogena-api.zdevs.uk/api", // Cambia esto por tu URL de Laravel/Node
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Configuración para enviar el Token automáticamente si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
