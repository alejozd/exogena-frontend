/**
 * Re-exports the axios client for use in services.
 * Services should import from here to maintain a single point of configuration.
 */
import api from "../api/axios";
export default api;
