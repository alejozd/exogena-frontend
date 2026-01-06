import axios from "axios";

const api = axios.create({
  // baseURL: "https://exogena-api.zdevs.uk/api", // Cambia esto por tu URL de Laravel/Node
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.warn("Sesión inválida o expirada. Limpiando...");
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // O como limpies tu sesión
      window.location.href = "/login"; // Redirección forzosa
    }
    return Promise.reject(error);
  }
);

export default api;
