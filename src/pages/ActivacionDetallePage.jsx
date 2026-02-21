import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Divider } from "primereact/divider";
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
        detail: "No se pudo cargar el detalle, " + error.message,
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
      detail: "Texto copiado al portapapeles",
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

  // Componente interno para los campos de datos
  const Field = ({ label, value, copyable, icon }) => (
    <div className="mb-4">
      <div className="text-xs font-bold uppercase tracking-wider text-500 mb-1 flex align-items-center">
        {icon && <i className={`${icon} mr-1`}></i>} {label}
      </div>
      <div className="flex align-items-center justify-content-between p-2 border-round bg-gray-900-alpha-20 border-1 border-gray-700">
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
          />
        )}
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="flex justify-content-center align-items-center min-h-screen bg-gray-900">
        <ProgressSpinner strokeWidth="3" />
      </div>
    );

  return (
    <div className="p-3 md:p-5 min-h-screen" style={{ background: "#0f172a" }}>
      <Toast ref={toast} />

      {!activacion ? (
        <div className="text-center mt-8">
          <h3 className="text-white">No se encontró el registro</h3>
          <Button
            label="Volver al Historial"
            icon="pi pi-arrow-left"
            onClick={() => navigate(-1)}
          />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* BARRA SUPERIOR REFORMADA CON BOTÓN CLARO */}
          <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center mb-5 gap-3">
            <div>
              <h1 className="m-0 text-white font-bold flex align-items-center">
                Detalle de Activación{" "}
                <span style={{ color: "#27eedeff" }} className="ml-3">
                  #{activacion.id}
                </span>
              </h1>
              <p className="text-gray-500 m-0 mt-1">
                <i className="pi pi-calendar mr-2"></i>
                Realizada el{" "}
                {new Date(activacion.fecha_activacion).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                label="Volver al Historial"
                icon="pi pi-arrow-left"
                className="p-button-outlined p-button-secondary text-white"
                style={{ borderColor: "#4b5563" }}
                onClick={() => navigate(-1)}
              />
            </div>
          </div>

          <div className="grid">
            {/* LADO IZQUIERDO: CLIENTE Y TIEMPO */}
            <div className="col-12 lg:col-4">
              <Card className="h-full bg-gray-800 border-none shadow-8 border-round-xl">
                <h3 className="text-white m-0 flex align-items-center">
                  <i className="pi pi-user text-cyan-400 mr-2"></i> Cliente
                </h3>
                <Divider className="opacity-20" />
                <Field
                  label="Razón Social"
                  value={activacion.ventas?.clientes?.razon_social}
                />
                <Field label="NIT" value={activacion.ventas?.clientes?.nit} />

                <div className="grid mt-2">
                  <div className="col-6">
                    <div className="text-xs font-bold text-500 uppercase">
                      Año Gravable
                    </div>
                    <div className="text-xl text-white font-bold">
                      {activacion.ventas?.ano_gravable}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-xs font-bold text-500 uppercase">
                      Estado Pago
                    </div>
                    <div
                      className={`text-sm font-bold ${activacion.ventas?.estado_pago === "pagado" ? "text-green-400" : "text-orange-400"}`}
                    >
                      {activacion.ventas?.estado_pago?.toUpperCase()}
                    </div>
                  </div>
                </div>

                <h3 className="text-white mt-5 m-0 flex align-items-center">
                  <i className="pi pi-history text-cyan-400 mr-2"></i> Historial
                </h3>
                <Divider className="opacity-20" />
                <Timeline
                  value={timelineEvents}
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
                          : "---"}
                      </small>
                    </div>
                  )}
                />
              </Card>
            </div>

            {/* LADO DERECHO: TÉCNICO */}
            <div className="col-12 lg:col-8">
              <div className="grid">
                <div className="col-12">
                  <Card className="bg-gray-800 border-none shadow-8 border-round-xl">
                    <h3 className="text-white m-0 flex align-items-center">
                      <i className="pi pi-desktop text-cyan-400 mr-2"></i> Datos
                      Técnicos del Equipo
                    </h3>
                    <Divider className="opacity-20" />
                    <div className="grid">
                      <div className="col-12 md:col-6">
                        <Field
                          label="Nombre del Equipo"
                          icon="pi pi-tag"
                          value={activacion.nombre_equipo}
                        />
                      </div>
                      <div className="col-12 md:col-6">
                        <Field
                          label="MAC Address"
                          icon="pi pi-share-alt"
                          value={activacion.mac_servidor}
                          copyable
                        />
                      </div>
                      <div className="col-12">
                        <Field
                          label="Dirección IP Origen"
                          icon="pi pi-map-marker"
                          value={activacion.ip_origen}
                        />
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="col-12">
                  <Card className="bg-gray-800 border-none shadow-8 border-round-xl">
                    <h3 className="text-white m-0 flex align-items-center">
                      <i className="pi pi-database text-cyan-400 mr-2"></i>{" "}
                      Información de Licencia
                    </h3>
                    <Divider className="opacity-20" />
                    <Field
                      label="Software"
                      value={activacion.ventas?.seriales_erp?.nombre_software}
                    />
                    <Field
                      label="Serial ERP Autorizado"
                      value={activacion.ventas?.seriales_erp?.serial_erp}
                      copyable
                    />
                    <Field
                      label="Serial Recibido (Petición)"
                      value={activacion.serial_recibido}
                      copyable
                    />
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
