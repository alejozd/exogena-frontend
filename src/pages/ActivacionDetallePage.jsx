import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Divider } from "primereact/divider";
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

  const Field = ({ label, value, highlight }) => (
    <div className="mb-3">
      <div className="text-sm text-500">{label}</div>
      <div
        className={`text-base font-medium ${
          highlight ? "text-emerald-400" : ""
        }`}
        style={{ wordBreak: "break-word" }}
      >
        {value || "N/A"}
      </div>
    </div>
  );

  return (
    <div className="p-3 md:p-4 max-w-6xl mx-auto">
      <Toast ref={toast} />

      {loading ? (
        <div className="flex justify-content-center mt-6">
          <ProgressSpinner />
        </div>
      ) : !id ? (
        <div className="text-center">
          <h3>ID inválido</h3>
          <Button label="Volver" onClick={() => navigate(-1)} />
        </div>
      ) : !activacion ? (
        <div className="text-center">
          <h3>No se encontró la activación</h3>
          <Button label="Volver" onClick={() => navigate(-1)} />
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center mb-4 gap-3">
            <div>
              <h2 className="m-0 text-xl md:text-2xl">
                Activación #{activacion.id}
              </h2>
              <div className="text-500 text-sm">
                {activacion.fecha_activacion
                  ? new Date(activacion.fecha_activacion).toLocaleString()
                  : ""}
              </div>
            </div>

            <Button
              label="Volver"
              icon="pi pi-arrow-left"
              className="p-button-outlined"
              onClick={() => navigate(-1)}
            />
          </div>

          {/* CONTENIDO */}
          <div className="grid">
            {/* INFORMACIÓN GENERAL */}
            <div className="col-12 md:col-6">
              <Card className="shadow-2 border-round-xl h-full">
                <h3 className="mt-0">Información General</h3>
                <Divider />
                <Field label="IP Origen" value={activacion.ip_origen} />
                <Field label="Nombre Equipo" value={activacion.nombre_equipo} />
                <Field label="MAC Servidor" value={activacion.mac_servidor} />
              </Card>
            </div>

            {/* CLIENTE */}
            <div className="col-12 md:col-6">
              <Card className="shadow-2 border-round-xl h-full">
                <h3 className="mt-0">Cliente</h3>
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
              <Card className="shadow-2 border-round-xl">
                <h3 className="mt-0">Software</h3>
                <Divider />
                <Field
                  label="Nombre Software"
                  value={activacion.ventas?.seriales_erp?.nombre_software}
                />
                <Field
                  label="Serial ERP"
                  value={activacion.ventas?.seriales_erp?.serial_erp}
                />
                <Field
                  label="Serial Recibido"
                  value={activacion.serial_recibido}
                  highlight
                />
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
