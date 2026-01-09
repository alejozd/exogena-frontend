import React, { useState, useRef } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import api from "../api/axios";

export const GenerarClavePage = () => {
  const [serial, setSerial] = useState("");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useRef(null);

  const handleGenerar = async () => {
    if (!serial.trim()) {
      toast.current.show({
        severity: "warn",
        summary: "Atención",
        detail: "Debes ingresar un serial Base64",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/generar-clave", { serial });
      setResultado(response.data);
      setError(null);
      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Clave generada correctamente",
      });
    } catch (error) {
      const mensajeError =
        error.response?.data?.error || "Error inesperado en el servidor";
      setResultado(null);
      setError(mensajeError);
      toast.current.show({
        severity: "error",
        summary: "No se pudo generar",
        detail: mensajeError,
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const copiarAlPortapapeles = (texto) => {
    navigator.clipboard.writeText(texto);
    toast.current.show({
      severity: "info",
      summary: "Copiado",
      detail: "Clave copiada al portapapeles",
      life: 2000,
    });
  };

  return (
    <div className="grid justify-content-center m-0">
      <Toast ref={toast} />
      {/* Ajustamos el ancho del col para que sea más responsivo */}
      <div className="col-12 sm:col-11 md:col-8 lg:col-6 p-2">
        <Card
          title={
            <span className="text-xl md:text-2xl">Generador de Claves</span>
          }
          className="shadow-3 border-round-xl overflow-hidden"
        >
          <p className="text-gray-600 mb-4 text-sm md:text-base">
            Ingresa el serial en Base64 para obtener la clave de activación.
          </p>

          <div className="flex flex-column gap-2">
            <label htmlFor="serial" className="font-bold text-sm">
              Serial ERP (Base64)
            </label>
            <InputTextarea
              id="serial"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              rows={4}
              autoResize
              className="w-full text-sm p-3 border-round-lg"
              placeholder="Pega aquí el código..."
              style={{ wordBreak: "break-all" }} // Evita que el texto pegado ensanche el textarea
            />
            <Button
              label={loading ? "Generando..." : "Generar Clave"}
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-key"}
              onClick={handleGenerar}
              disabled={loading}
              className="mt-2 w-full md:w-auto align-self-end border-round-lg"
            />
          </div>

          {error && (
            <div className="mt-4 fadein">
              <div className="flex align-items-center p-3 border-round bg-red-50 border-1 border-red-200">
                <i className="pi pi-exclamation-circle text-red-500 mr-2"></i>
                <span className="text-red-700 font-medium text-xs md:text-sm">
                  {error}
                </span>
              </div>
            </div>
          )}

          {resultado && (
            <div className="mt-4 fadein animation-duration-500">
              <Divider align="left">
                <span className="p-tag p-tag-info text-xs">
                  Información Procesada
                </span>
              </Divider>

              <div className="surface-ground p-3 md:p-4 border-round-lg border-1 border-200 overflow-hidden">
                <div className="grid">
                  <div className="col-12 md:col-6 mb-2">
                    <label className="block text-500 font-medium mb-1 text-xs uppercase">
                      Serial ERP
                    </label>
                    <div className="text-900 font-bold text-sm md:text-base">
                      {resultado.serialERP}
                    </div>
                  </div>
                  <div className="col-12 md:col-6 mb-2">
                    <label className="block text-500 font-medium mb-1 text-xs uppercase">
                      Año Gravable
                    </label>
                    <div className="text-900 font-bold text-sm md:text-base">
                      {resultado.anoMedios}
                    </div>
                  </div>
                  <div className="col-12 mb-3">
                    <label className="block text-500 font-medium mb-1 text-xs uppercase">
                      MAC Servidor
                    </label>
                    <div className="text-900 font-bold font-monospace text-sm md:text-base break-all">
                      {resultado.macServidor}
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="block text-primary font-bold mb-2 text-sm">
                      Clave de Activación Generada
                    </label>
                    <div className="flex flex-column sm:flex-row gap-2">
                      <div
                        className="surface-0 p-3 border-round border-1 border-primary text-primary font-bold flex-grow-1 text-center shadow-1 overflow-hidden"
                        style={{
                          wordBreak: "break-all",
                          fontSize: "clamp(1rem, 4vw, 1.25rem)", // Tamaño de fuente fluido
                          lineHeight: "1.4",
                        }}
                      >
                        {resultado.claveGenerada}
                      </div>
                      <Button
                        icon="pi pi-copy"
                        label="Copiar"
                        className="p-button-outlined border-round-lg"
                        onClick={() =>
                          copiarAlPortapapeles(resultado.claveGenerada)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
