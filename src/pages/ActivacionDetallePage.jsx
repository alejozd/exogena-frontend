import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { Timeline } from "primereact/timeline";
import { activacionesService } from "../services";

export const ActivacionDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useRef(null);
  const [activacion, setActivacion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    loadDetalle();
  }, [id]);

  const loadDetalle = async () => {
    try {
      const response = await activacionesService.getById(id);
      setActivacion(response.data || null);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar el detalle",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const copiarTexto = (texto) => {
    navigator.clipboard.writeText(texto);
    toast.current?.show({
      severity: "success",
      summary: "Copiado",
      detail: "Texto copiado",
      life: 2000,
    });
  };

  const timelineEvents = [
    {
      status: "Venta registrada",
      date: activacion?.ventas?.fecha_venta,
      icon: "pi pi-shopping-cart",
      color: "#f59e0b",
    },
    {
      status: "Activación realizada",
      date: activacion?.fecha_activacion,
      icon: "pi pi-check-circle",
      color: "#27eedeff",
    },
  ];

  const Field = ({ label, value, copyable, icon }) => (
    <div className="mb-4">
      <div className="text-xs font-bold uppercase tracking-wider text-500 mb-1 flex align-items-center">
        {icon && <i className={`${icon} mr-1`}></i>} {label}
      </div>
      <div className="flex align-items-center justify-content-between p-2 border-round bg-gray-900-alpha-20 border-1 border-gray-800">
        <span
          className="text-sm md:text-base font-mono text-blue-100"
          style={{ wordBreak: "break-all" }}
        >
          {value || "N/A"}
        </span>
        {copyable && value && (
          <Button
            icon="pi pi-copy"
            className="p-button-text p-button-sm p-0 ml-2 text-cyan-400"
            onClick={() => copiarTexto(value)}
            tooltip="Copiar"
          />
        )}
      </div>
    </div>
  );

  const StatusBadge = ({ value }) => {
    const isPaid = value?.toLowerCase() === "pagado";
    return (
      <div
        className="px-3 py-1 border-round-2xl font-bold text-xs"
        style={{
          backgroundColor: isPaid
            ? "rgba(34, 197, 94, 0.2)"
            : "rgba(245, 158, 11, 0.2)",
          color: isPaid ? "#4ade80" : "#fbbf24",
          border: `1px solid ${isPaid ? "#4ade80" : "#fbbf24"}`,
        }}
      >
        {value?.toUpperCase() || "DESCONOCIDO"}
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex justify-content-center align-items-center min-h-screen bg-gray-900">
        <ProgressSpinner strokeWidth="3" fill="transparent" />
      </div>
    );

  return (
    <div className="p-3 md:p-5 min-h-screen" style={{ background: "#0f172a" }}>
      <Toast ref={toast} />

      {!activacion ? (
        <div className="text-center mt-8">
          <i className="pi pi-exclamation-circle text-6xl text-gray-700 mb-4"></i>
          <h3 className="text-white">No se encontró el registro</h3>
          <Button
            label="Regresar al Historial"
            icon="pi pi-arrow-left"
            onClick={() => navigate(-1)}
          />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* TOP BAR / HEADER */}
          <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-end mb-5 gap-3">
            <div>
              <Button
                label="Volver"
                icon="pi pi-chevron-left"
                className="p-button-text text-gray-400 p-0 mb-2 hover:text-white"
                onClick={() => navigate(-1)}
              />
              <h1 className="m-0 text-white font-bold flex align-items-center">
                ID Activación:{" "}
                <span style={{ color: "#27eedeff" }} className="ml-2">
                  #{activacion.id}
                </span>
              </h1>
              <p className="text-gray-500 m-0">
                Registro originado desde la IP: {activacion.ip_origen}
              </p>
            </div>
            <div className="flex align-items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-gray-500 text-xs uppercase font-bold">
                  Estado de Pago
                </div>
                <StatusBadge value={activacion?.ventas?.estado_pago} />
              </div>
              <Divider layout="vertical" className="hidden md:block" />
              <div className="bg-gray-800 p-3 border-round-xl border-1 border-gray-700">
                <div className="text-gray-500 text-xs uppercase font-bold mb-1">
                  Año Gravable
                </div>
                <div className="text-2xl font-bold text-white text-center">
                  {activacion.ventas?.ano_gravable}
                </div>
              </div>
            </div>
          </div>

          <div className="grid">
            {/* LADO IZQUIERDO: CLIENTE Y VENTA */}
            <div className="col-12 lg:col-4">
              <Card className="h-full bg-gray-800 border-none shadow-8 border-round-xl">
                <h3 className="text-white m-0 flex align-items-center">
                  <i className="pi pi-user text-cyan-400 mr-2 text-xl"></i>{" "}
                  Datos del Cliente
                </h3>
                <Divider className="opacity-20" />
                <Field
                  label="Razón Social"
                  value={activacion.ventas?.clientes?.razon_social}
                />
                <Field
                  label="NIT / Identificación"
                  value={activacion.ventas?.clientes?.nit}
                />
                <Field
                  label="Año de Venta"
                  value={activacion.ventas?.ano_venta}
                />

                <h3 className="text-white mt-5 m-0 flex align-items-center">
                  <i className="pi pi-clock text-cyan-400 mr-2 text-xl"></i>{" "}
                  Línea de Tiempo
                </h3>
                <Divider className="opacity-20" />
                <Timeline
                  value={timelineEvents}
                  className="customized-timeline"
                  marker={(item) => (
                    <span
                      className="flex align-items-center justify-content-center border-circle p-2"
                      style={{ backgroundColor: item.color }}
                    >
                      <i className={`${item.icon} text-gray-900 text-xs`}></i>
                    </span>
                  )}
                  content={(item) => (
                    <div className="mb-4 ml-2">
                      <div className="text-white font-bold text-sm">
                        {item.status}
                      </div>
                      <small className="text-gray-500">
                        {item.date
                          ? new Date(item.date).toLocaleString()
                          : "Pendiente"}
                      </small>
                    </div>
                  )}
                />
              </Card>
            </div>

            {/* LADO DERECHO: DETALLES TÉCNICOS */}
            <div className="col-12 lg:col-8">
              <div className="grid">
                {/* SOFTWARE INFO */}
                <div className="col-12">
                  <Card className="bg-gray-800 border-none shadow-8 border-round-xl">
                    <h3 className="text-white m-0 flex align-items-center">
                      <i className="pi pi-box text-cyan-400 mr-2 text-xl"></i>{" "}
                      Especificaciones del Software
                    </h3>
                    <Divider className="opacity-20" />
                    <div className="grid">
                      <div className="col-12 md:col-6">
                        <Field
                          label="Nombre del Producto"
                          value={
                            activacion.ventas?.seriales_erp?.nombre_software
                          }
                        />
                      </div>
                      <div className="col-12 md:col-6">
                        <Field
                          label="Serial Autorizado (ERP)"
                          value={activacion.ventas?.seriales_erp?.serial_erp}
                          copyable
                        />
                      </div>
                      <div className="col-12">
                        <Field
                          label="Serial Recibido en Petición"
                          value={activacion.serial_recibido}
                          copyable
                        />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* HARDWARE INFO */}
                <div className="col-12">
                  <Card className="bg-gray-800 border-none shadow-8 border-round-xl">
                    <h3 className="text-white m-0 flex align-items-center">
                      <i className="pi pi-desktop text-cyan-400 mr-2 text-xl"></i>{" "}
                      Identificación del Equipo
                    </h3>
                    <Divider className="opacity-20" />
                    <div className="grid">
                      <div className="col-12 md:col-6">
                        <Field
                          label="Hostname / Nombre Equipo"
                          icon="pi pi-tag"
                          value={activacion.nombre_equipo}
                        />
                      </div>
                      <div className="col-12 md:col-6">
                        <Field
                          label="Dirección MAC"
                          icon="pi pi-share-alt"
                          value={activacion.mac_servidor}
                          copyable
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        :global(.p-card .p-card-body) {
          padding: 1.5rem;
        }
        :global(.p-timeline-event-opposite) {
          display: none;
        }
        :global(.p-timeline-event-content) {
          padding: 0 1rem !important;
        }
      `}</style>
    </div>
  );
};
