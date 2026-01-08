import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Login } from "../pages/Login";
import { Dashboard } from "../pages/Dashboard";
import { VendedoresPage } from "../pages/VendedoresPage";
import { ClientesPage } from "../pages/ClientesPage";
import { SerialesPage } from "../pages/SerialesPage";
import { ActivacionesPage } from "../pages/Activaciones";
import { GenerarClavePage } from "../pages/GenerarClavePage";
import { VentasListPage } from "../pages/VentasListPage";
import { VentaFormPage } from "../pages/VentaFormPage";
import { MainLayout } from "../components/MainLayout";

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Mientras se verifica si el token es válido, no mostramos nada o un spinner
  if (loading) {
    return (
      <div
        className="flex align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <i
          className="pi pi-spin pi-spinner"
          style={{ fontSize: "2rem", color: "white" }}
        ></i>
      </div>
    );
  }

  // Si no hay usuario después de cargar, mandamos al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const AppRouter = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública: Si ya está logeado y trata de ir al login, lo mandamos al dashboard */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
        />

        {/* Rutas Protegidas CON Layout */}
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          {/* Todas estas rutas tendrán el menú lateral automáticamente */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vendedores" element={<VendedoresPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/seriales" element={<SerialesPage />} />
          <Route path="/activaciones" element={<ActivacionesPage />} />
          <Route path="/generar-clave" element={<GenerarClavePage />} />
          <Route path="/ventas" element={<VentasListPage />} />
          <Route path="/ventas/nueva" element={<VentaFormPage />} />
          <Route path="/ventas/editar/:id" element={<VentaFormPage />} />
          <Route path="/ventas/detalle/:id" element={<VentaFormPage />} />

          {/* Aquí irás agregando más rutas protegidas:
            <Route path="/activaciones" element={<Activaciones />} /> 
          */}
        </Route>

        {/* Redirección por defecto: 
            Si el usuario escribe cualquier cosa en la URL, 
            lo mandamos a dashboard (si está logeado) o al login.
        */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};
