import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Login } from "../pages/Login";
import { Dashboard } from "../pages/Dashboard";
import { MainLayout } from "../components/MainLayout";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  // Si no hay usuario, mandamos al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />
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

          {/* Aquí irás agregando más páginas más adelante:
                    <Route path="/activaciones" element={<Activaciones />} /> 
                    */}
        </Route>
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
