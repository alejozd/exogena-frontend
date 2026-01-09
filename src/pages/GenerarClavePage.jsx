import React, { useState, useRef } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import api from "../api/axios"; // Tu instancia de axios configurada

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
      setError(null); // Limpiamos errores previos
      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Clave generada correctamente",
      });
    } catch (error) {
      console.error("Error capturado:", error);

      // Extraemos el mensaje del backend: error.response.data.error
      const mensajeError =
        error.response?.data?.error || "Error inesperado en el servidor";

      setResultado(null); // Limpiamos resultados previos si falla
      setError(mensajeError);

      toast.current.show({
        severity: "error",
        summary: "No se pudo generar",
        detail: mensajeError,
        life: 5000, // Le damos más tiempo para que el usuario lo lea
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
    <div className="grid justify-content-center">
      <Toast ref={toast} />
      <div className="col-12 md:col-8 lg:col-6">
        <Card
          title="Generador de Claves - Medios Magnéticos"
          className="shadow-2 border-round-xl"
        >
          <p className="text-gray-600 mb-4">
            Ingresa el serial en Base64 recibido desde el sistema Delphi para
            obtener la clave de activación.
          </p>

          <div className="flex flex-column gap-2">
            <label htmlFor="serial" className="font-bold">
              Serial ERP (Base64)
            </label>
            <InputTextarea
              id="serial"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              rows={4}
              autoResize
              className="w-full"
              placeholder="Pega aquí el código del sistema..."
            />
            <Button
              label={loading ? "Generando..." : "Generar Clave"}
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-key"}
              onClick={handleGenerar}
              disabled={loading}
              className="mt-2 w-full md:w-auto align-self-end"
            />
          </div>
          {/* --- SECCIÓN DE ERROR --- */}
          {error && (
            <div className="mt-4 fadein">
              <div className="flex align-items-center justify-content-center p-3 border-round bg-red-50 border-1 border-red-200">
                <i
                  className="pi pi-exclamation-circle text-red-500 mr-2"
                  style={{ fontSize: "1.2rem" }}
                ></i>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* --- SECCIÓN DE RESULTADO --- */}
          {resultado && (
            <div className="mt-5 fadein animation-duration-500">
              <Divider align="left">
                <span className="p-tag p-tag-info">Información Procesada</span>
              </Divider>

              <div className="surface-ground p-4 border-round-lg border-1 border-200">
                <div className="grid">
                  <div className="col-12 md:col-6 mb-3">
                    <label className="block text-500 font-medium mb-1 text-sm">
                      Serial ERP
                    </label>
                    <div className="text-900 font-bold">
                      {resultado.serialERP}
                    </div>
                  </div>
                  <div className="col-12 md:col-6 mb-3">
                    <label className="block text-500 font-medium mb-1 text-sm">
                      Año Gravable
                    </label>
                    <div className="text-900 font-bold">
                      {resultado.anoMedios}
                    </div>
                  </div>
                  <div className="col-12 mb-3">
                    <label className="block text-500 font-medium mb-1 text-sm">
                      MAC Servidor
                    </label>
                    <div className="text-900 font-bold font-monospace">
                      {resultado.macServidor}
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="block text-primary font-bold mb-2">
                      Clave de Activación Generada
                    </label>
                    <div className="flex flex-column md:flex-row gap-2">
                      <div
                        className="surface-0 p-2 md:p-3 border-round border-1 border-primary text-primary font-bold flex-grow-1 text-center text-lg md:text-xl shadow-1"
                        style={{
                          wordBreak: "break-all", // Rompe el texto para que no se desborde
                          lineHeight: "1.5",
                        }}
                      >
                        {resultado.claveGenerada}
                      </div>
                      <Button
                        icon="pi pi-copy"
                        label="Copiar" // Agregamos label para que sea más fácil de tocar en móvil
                        className="p-button-outlined w-full md:w-auto"
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
