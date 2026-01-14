import React, { useState, useRef } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import { Chip } from "primereact/chip";
import api from "../api/axios";
import "../styles/GenerarClave.css"; // Importamos los nuevos estilos

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
        summary: "Sistema Actualizado",
        detail: "Clave de activación generada con éxito",
      });
    } catch (error) {
      const mensajeError =
        error.response?.data?.error || "Error en el algoritmo de generación";
      setResultado(null);
      setError(mensajeError);
      toast.current.show({
        severity: "error",
        summary: "Fallo de Generación",
        detail: mensajeError,
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
      detail: "Código enviado al portapapeles",
      life: 2000,
    });
  };

  return (
    <div className="clave-container p-3">
      <Toast ref={toast} />

      {/* Ampliamos col-8 en tablets y col-7 en laptops grandes para mejor visibilidad */}
      <div className="col-12 md:col-10 lg:col-7 xl:col-6 transition-all duration-500">
        <div className="p-4 md:p-6 border-round-xl card-neon">
          <div className="text-center mb-5">
            <h1 className="m-0 text-4xl font-bold" style={{ color: "#60A5FA" }}>
              Generador de <span style={{ color: "#34D399" }}>Claves</span>
            </h1>
            <p className="text-blue-200-alpha-70 mt-2">
              Medios Magnéticos - Sonda ERP
            </p>
          </div>

          <div className="flex flex-column gap-3">
            <label
              htmlFor="serial"
              className="text-blue-300 font-medium ml-1 flex align-items-center"
            >
              <i className="pi pi-database mr-2"></i> Serial ERP (Base64)
            </label>
            <InputTextarea
              id="serial"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              rows={6}
              className="w-full bg-gray-900 text-blue-100 border-1 border-blue-900 p-4 border-round-lg input-neon shadow-inner"
              placeholder="Pegue aquí el código Base64 obtenido del sistema..."
              style={{
                wordBreak: "break-all",
                resize: "none",
                fontSize: "1.1rem",
              }}
            />

            <Button
              label={
                loading
                  ? "PROCESANDO ALGORITMO..."
                  : "GENERAR CLAVE DE ACTIVACIÓN"
              }
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-bolt"}
              onClick={handleGenerar}
              disabled={loading}
              className="p-button-lg border-round-lg mt-3 font-bold btn-gradient shadow-4"
            />
          </div>

          {error && (
            <div className="mt-4 p-3 border-round bg-red-900-alpha-20 border-1 border-red-500 fadein">
              <div className="flex align-items-center text-red-400">
                <i className="pi pi-times-circle mr-2 text-xl"></i>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {resultado && (
            <div className="mt-6 fadein animation-duration-500">
              <Divider align="center">
                <Chip
                  label="DATOS DECODIFICADOS"
                  icon="pi pi-shield"
                  className="bg-blue-900 text-blue-100 text-xs px-3"
                />
              </Divider>

              <div className="grid mt-4">
                <div className="col-12 md:col-6 mb-3">
                  <div className="p-4 border-round-lg bg-gray-900 border-left-3 border-blue-500 shadow-2">
                    <span className="block text-blue-400 text-xs font-bold uppercase mb-2">
                      ID Sistema
                    </span>
                    <span className="text-2xl font-code text-white">
                      {resultado.serialERP}
                    </span>
                  </div>
                </div>
                <div className="col-12 md:col-6 mb-3">
                  <div className="p-4 border-round-lg bg-gray-900 border-left-3 border-emerald-500 shadow-2">
                    <span className="block text-emerald-400 text-xs font-bold uppercase mb-2">
                      Período Fiscal
                    </span>
                    <span className="text-2xl font-bold text-white">
                      {resultado.anoMedios}
                    </span>
                  </div>
                </div>

                <div className="col-12 mb-4">
                  <div className="p-3 border-round-lg bg-gray-800-alpha-40 border-1 border-gray-800">
                    <span className="block text-gray-500 text-xs font-bold uppercase mb-1">
                      Dirección Física (MAC)
                    </span>
                    <span className="text-md font-code text-gray-400 break-all">
                      {resultado.macServidor}
                    </span>
                  </div>
                </div>

                <div className="col-12">
                  <div className="p-4 border-round-xl clave-resultado-box shadow-4">
                    <label className="block text-emerald-400 font-bold mb-3 text-center text-sm tracking-widest">
                      KEY CODE GENERADO
                    </label>

                    {/* Cambiamos a un layout que maneja mejor el espacio del botón */}
                    <div className="flex flex-column md:flex-row gap-3 align-items-stretch md:align-items-center">
                      <div className="bg-black-alpha-90 p-3 border-round-lg text-emerald-400 font-bold text-center text-xl md:text-3xl shadow-inner border-1 border-emerald-900 flex-grow-1 font-code clave-display">
                        {resultado.claveGenerada}
                      </div>

                      <Button
                        icon="pi pi-copy"
                        label="COPIAR"
                        className="p-button-success p-button-outlined font-bold btn-copiar-custom"
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
        </div>
      </div>
    </div>
  );
};
