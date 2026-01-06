import React, { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Login.css";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useRef(null);

  // Nueva función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault(); // EVITA que la página se recargue
    handleLogin();
  };

  const handleLogin = async () => {
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

      const user = response.data.usuario;
      const token = response.data.token;

      if (token) {
        login(user, token);
        toast.current.show({
          severity: "success",
          summary: "Bienvenido",
          detail: `Hola, ${user.name || "Usuario"}`,
          life: 2000,
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        throw new Error("No se recibió un token del servidor");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Credenciales incorrectas";
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
      <Toast ref={toast} />
      <div className="login-content">
        <div className="login-logo">
          Exógena<span> 2025</span>
        </div>

        <div className="glass-card">
          <h2 className="text-center text-white font-normal mb-5 mt-0">
            Control de Activaciones
          </h2>

          {/* CAMBIO: Envolvemos todo en un form con onSubmit */}
          <form onSubmit={handleSubmit} className="flex flex-column gap-4">
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
              type="submit" // IMPORTANTE: tipo submit para que Enter funcione
              label={loading ? "Verificando..." : "Entrar"}
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
              className="w-full p-3 btn-gradient border-round-xl"
              loading={loading}
            />

            <a href="#" className="text-center link-recovery text-sm">
              ¿Olvidaste tu contraseña? Recuperar
            </a>
          </form>
        </div>
      </div>
    </div>
  );
};
