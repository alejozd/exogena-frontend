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
        detail:
          "No se pudo cargar el detalle: " +
          (error.response?.data?.error || error.message),
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

  const estadoPagoTemplate = () => {
    const estado = activacion?.ventas?.estado_pago;

    if (!estado) return null;

    const severity =
      estado === "pagado"
        ? "success"
        : estado === "pendiente"
          ? "warning"
          : "danger";

    return <Tag value={estado.toUpperCase()} severity={severity} />;
  };

  const timelineEvents = [
    {
      status: "Venta registrada",
      date: activacion?.ventas?.fecha_venta,
      icon: "pi pi-shopping-cart",
    },
    {
      status: "Activación realizada",
      date: activacion?.fecha_activacion,
      icon: "pi pi-key",
    },
  ];

  const Field = ({ label, value, copyable }) => (
    <div className="mb-3">
      <div className="text-sm text-400">{label}</div>
      <div className="flex align-items-center justify-content-between gap-2">
        <div
          className="text-base font-medium text-100"
          style={{ wordBreak: "break-word" }}
        >
          {value || "N/A"}
        </div>
        {copyable && value && (
          <Button
            icon="pi pi-copy"
            className="p-button-text p-button-sm"
            onClick={() => copiarTexto(value)}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="p-3 md:p-4 min-h-screen" style={{ background: "#0f172a" }}>
      <Toast ref={toast} />

      {loading ? (
        <div className="flex justify-content-center mt-6">
          <ProgressSpinner />
        </div>
      ) : !activacion ? (
        <div className="text-center text-100">
          <h3>No se encontró la activación</h3>
          <Button label="Volver" onClick={() => navigate(-1)} />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center mb-4 gap-3 text-100">
            <div>
              <h2 className="m-0">Activación #{activacion.id}</h2>
              <div className="text-400 text-sm">
                {new Date(activacion.fecha_activacion).toLocaleString()}
              </div>
            </div>

            <div className="flex gap-2 align-items-center">
              {estadoPagoTemplate()}
              <Button
                label="Volver"
                icon="pi pi-arrow-left"
                className="p-button-outlined p-button-secondary"
                onClick={() => navigate(-1)}
              />
            </div>
          </div>

          <div className="grid">
            {/* INFORMACIÓN GENERAL */}
            <div className="col-12 md:col-6">
              <Card className="shadow-4 border-round-xl surface-card bg-gray-800 text-100">
                <h3>
                  <i className="pi pi-server mr-2"></i>
                  Información General
                </h3>
                <Divider />
                <Field label="IP Origen" value={activacion.ip_origen} />
                <Field label="Nombre Equipo" value={activacion.nombre_equipo} />
                <Field
                  label="MAC Servidor"
                  value={activacion.mac_servidor}
                  copyable
                />
              </Card>
            </div>

            {/* CLIENTE */}
            <div className="col-12 md:col-6">
              <Card className="shadow-4 border-round-xl bg-gray-800 text-100">
                <h3>
                  <i className="pi pi-user mr-2"></i>
                  Cliente
                </h3>
                <Divider />
                <Field
                  label="Razón Social"
                  value={activacion.ventas?.clientes?.razon_social}
                />
                <Field label="NIT" value={activacion.ventas?.clientes?.nit} />
                <Field
                  label="Año Gravable"
                  value={activacion.ventas?.ano_gravable}
                />
                <Field label="Año Venta" value={activacion.ventas?.ano_venta} />
              </Card>
            </div>

            {/* SOFTWARE */}
            <div className="col-12">
              <Card className="shadow-4 border-round-xl bg-gray-800 text-100">
                <h3>
                  <i className="pi pi-cog mr-2"></i>
                  Software
                </h3>
                <Divider />
                <Field
                  label="Nombre Software"
                  value={activacion.ventas?.seriales_erp?.nombre_software}
                />
                <Field
                  label="Serial ERP"
                  value={activacion.ventas?.seriales_erp?.serial_erp}
                  copyable
                />
                <Field
                  label="Serial Recibido"
                  value={activacion.serial_recibido}
                  copyable
                />
              </Card>
            </div>

            {/* TIMELINE */}
            <div className="col-12">
              <Card className="shadow-4 border-round-xl bg-gray-800 text-100">
                <h3>
                  <i className="pi pi-clock mr-2"></i>
                  Historial
                </h3>
                <Divider />
                <Timeline
                  value={timelineEvents}
                  content={(item) => (
                    <small>
                      {item.date ? new Date(item.date).toLocaleString() : ""}
                    </small>
                  )}
                  marker={(item) => (
                    <span className="custom-marker p-shadow-2">
                      <i className={item.icon}></i>
                    </span>
                  )}
                />
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
