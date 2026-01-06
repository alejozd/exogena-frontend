import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { Menubar } from "primereact/menubar";
import { Avatar } from "primereact/avatar";
import "../styles/Layout.css";

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false); // Control del menú lateral

  const menuItems = [
    {
      label: "Panel Principal",
      icon: "pi pi-home",
      command: () => {
        navigate("/dashboard");
        setVisible(false);
      },
    },
    {
      label: "Activaciones",
      icon: "pi pi-bolt",
      command: () => {
        navigate("/activaciones");
        setVisible(false);
      },
    },
    {
      label: "Vendedores",
      icon: "pi pi-id-card",
      command: () => {
        navigate("/vendedores");
        setVisible(false);
      },
    },
    {
      label: "Clientes",
      icon: "pi pi-users",
      command: () => {
        navigate("/clientes");
        setVisible(false);
      },
    },
    {
      label: "Seriales",
      icon: "pi pi-key",
      command: () => {
        navigate("/seriales");
        setVisible(false);
      },
    },
    {
      label: "Usuarios",
      icon: "pi pi-users",
      command: () => {
        navigate("/usuarios");
        setVisible(false);
      },
    },
  ];

  // Contenido de la derecha en el Menubar
  const end = (
    <div className="flex align-items-center gap-3">
      <div className="text-right hidden sm:block">
        <div className="font-bold text-white text-sm">{user?.email}</div>
        <small className="text-blue-400">Administrador</small>
      </div>
      <Avatar
        icon="pi pi-user"
        shape="circle"
        className="bg-blue-500 text-white"
      />
    </div>
  );

  // Icono de inicio (Hamburgesa)
  const start = (
    <Button
      icon="pi pi-bars"
      onClick={() => setVisible(true)}
      className="p-button-text text-white mr-2"
    />
  );

  return (
    <div className="layout-container">
      {/* Sidebar Colapsable (Mobile & Desktop) */}
      <Sidebar
        visible={visible}
        onHide={() => setVisible(false)}
        className="custom-sidebar"
      >
        <div className="flex flex-column h-full">
          <div className="p-4 text-center border-bottom-1 border-white-alpha-10 mb-4">
            <span className="text-2xl font-bold text-white">
              Exógena<span className="text-blue-400">2025</span>
            </span>
          </div>

          <div className="flex-grow-1">
            {menuItems.map((item) => (
              <div
                key={item.label}
                className="custom-menu-item"
                onClick={item.command}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="p-4 border-top-1 border-white-alpha-10">
            <Button
              label="Cerrar Sesión"
              icon="pi pi-power-off"
              className="p-button-danger p-button-outlined w-full"
              onClick={logout}
            />
          </div>
        </div>
      </Sidebar>

      {/* Menubar Superior */}
      <Menubar
        model={[]} // Pasamos vacío porque usaremos el botón 'start' para el Sidebar
        start={start}
        end={end}
        className="layout-menubar"
      />

      {/* Contenido Dinámico */}
      <main className="layout-content">
        <div className="fadein animation-duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
