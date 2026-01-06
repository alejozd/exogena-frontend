import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor de Peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si no hay respuesta del servidor (error de red)
    if (!error.response) {
      console.error("Error de red o servidor no disponible");
      return Promise.reject(error);
    }

    const { status } = error.response;

    // 401: Token expirado / No autorizado
    // 403: Prohibido (aunque el token sea válido, no tienes permiso)
    if (status === 401 || status === 403) {
      // Evitamos redirigir si ya estamos en el login (para no crear bucles)
      if (!window.location.pathname.includes("/login")) {
        console.warn("Sesión inválida. Limpiando credenciales...");

        // Limpiamos todo rastro de la sesión
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Opcional: Limpiar filtros guardados si quieres un reset total
        // localStorage.removeItem("ventas_filtro_ano");

        // Redirección inmediata
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
