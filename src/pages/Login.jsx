import React, { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast"; // Para mensajes de error
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // Importamos tu config de axios
import "../styles/Login.css";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useRef(null);

  const handleLogin = async () => {
    // Validación básica
    if (!username || !password) {
      toast.current.show({
        severity: "warn",
        summary: "Atención",
        detail: "Ingresa usuario y contraseña",
        life: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: username,
        password: password,
      });

      //   console.log("Respuesta de la API:", response.data);

      // Mapeamos los nombres exactos que vimos en tu consola:
      const user = response.data.usuario; // Tu API usa 'usuario'
      const token = response.data.token; // Tu API usa 'token'

      if (token) {
        // Ejecutamos el login del contexto
        login(user, token);

        // Mensaje de éxito opcional antes de navegar
        toast.current.show({
          severity: "success",
          summary: "Bienvenido",
          detail: `Hola, ${user.name || "Usuario"}`,
          life: 2000,
        });

        // Navegamos al dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        throw new Error("No se recibió un token del servidor");
      }
    } catch (error) {
      console.error("Error detallado:", error);
      const msg =
        error.response?.data?.message ||
        "Credenciales incorrectas o error de servidor";
      toast.current.show({
        severity: "error",
        summary: "Error de acceso",
        detail: msg,
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Toast ref={toast} /> {/* Contenedor de notificaciones */}
      <div className="login-content">
        <div className="login-logo">
          Exógena<span> 2025</span>
        </div>

        <div className="glass-card">
          <h2 className="text-center text-white font-normal mb-5 mt-0">
            Control de Activaciones
          </h2>

          <div className="flex flex-column gap-4">
            <div className="custom-input-group">
              <i className="pi pi-user custom-icon" />
              <InputText
                placeholder="Usuario / Email"
                className="w-full p-3 custom-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="custom-input-group">
              <i className="pi pi-lock custom-icon" />
              <Password
                placeholder="Contraseña"
                toggleMask
                feedback={false}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                inputClassName="custom-input p-3"
                disabled={loading}
              />
            </div>

            <Button
              label={loading ? "Verificando..." : "Entrar"}
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
              className="w-full p-3 btn-gradient border-round-xl"
              onClick={handleLogin}
              loading={loading}
            />

            <a href="#" className="text-center link-recovery text-sm">
              ¿Olvidaste tu contraseña? Recuperar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
