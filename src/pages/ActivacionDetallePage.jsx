import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
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
      console.log("ID recibido:", id);

      const response = await activacionesService.getById(id);

      console.log("Respuesta backend:", response.data);

      if (!response.data) {
        setActivacion(null);
        return;
      }

      setActivacion(response.data);
    } catch (error) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail:
            "No se pudo cargar el detalle: " +
            (error.response?.data?.error || error.message),
          life: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />

      {loading ? (
        <div className="flex justify-content-center mt-6">
          <ProgressSpinner />
        </div>
      ) : !id ? (
        <div>
          <h3>ID inválido.</h3>
          <Button label="Volver" onClick={() => navigate(-1)} />
        </div>
      ) : !activacion ? (
        <div>
          <h3>No se encontró la activación.</h3>
          <Button label="Volver" onClick={() => navigate(-1)} />
        </div>
      ) : (
        <>
          <div className="flex justify-content-between align-items-center mb-4">
            <h2 className="m-0">Detalle de Activación #{activacion.id}</h2>
            <Button
              label="Volver"
              icon="pi pi-arrow-left"
              onClick={() => navigate(-1)}
            />
          </div>

          <Card className="shadow-2 border-round-xl bg-gray-900">
            <div className="grid">
              <div className="col-12 md:col-6">
                <h4>Información General</h4>

                <p>
                  <strong>Fecha Activación:</strong>
                  <br />
                  {activacion.fecha_activacion
                    ? new Date(activacion.fecha_activacion).toLocaleString()
                    : "N/A"}
                </p>

                <p>
                  <strong>IP Origen:</strong>
                  <br />
                  {activacion.ip_origen || "N/A"}
                </p>

                <p>
                  <strong>Nombre Equipo:</strong>
                  <br />
                  {activacion.nombre_equipo || "N/A"}
                </p>

                <p>
                  <strong>MAC Servidor:</strong>
                  <br />
                  <code>{activacion.mac_servidor || "N/A"}</code>
                </p>
              </div>

              <div className="col-12 md:col-6">
                <h4>Información Cliente</h4>

                <p>
                  <strong>Razón Social:</strong>
                  <br />
                  {activacion.ventas?.clientes?.razon_social || "N/A"}
                </p>

                <p>
                  <strong>NIT:</strong>
                  <br />
                  {activacion.ventas?.clientes?.nit || "N/A"}
                </p>

                <p>
                  <strong>Año Gravable:</strong>
                  <br />
                  {activacion.ventas?.ano_gravable || "N/A"}
                </p>

                <p>
                  <strong>Año Venta:</strong>
                  <br />
                  {activacion.ventas?.ano_venta || "N/A"}
                </p>
              </div>

              <div className="col-12">
                <h4>Software</h4>

                <p>
                  <strong>Nombre Software:</strong>
                  <br />
                  {activacion.ventas?.seriales_erp?.nombre_software || "N/A"}
                </p>

                <p>
                  <strong>Serial ERP:</strong>
                  <br />
                  <code>
                    {activacion.ventas?.seriales_erp?.serial_erp || "N/A"}
                  </code>
                </p>

                <p>
                  <strong>Serial Recibido:</strong>
                  <br />
                  <code className="text-emerald-400">
                    {activacion.serial_recibido || "N/A"}
                  </code>
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
