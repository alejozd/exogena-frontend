import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Skeleton } from "primereact/skeleton";
import { Dropdown } from "primereact/dropdown"; // Importamos el Dropdown

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado para el año seleccionado (puedes poner 2024 o dinámico)
  const [selectedYear, setSelectedYear] = useState(2024);

  // Opciones para el selector
  const years = [
    { label: "Año 2023", value: 2023 },
    { label: "Año 2024", value: 2024 },
    { label: "Año 2025", value: 2025 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true); // Mostramos skeleton al cambiar de año
      try {
        // Ahora pasamos el parámetro ?ano= al backend
        const response = await api.get(`/dashboard/stats?ano=${selectedYear}`);
        setData(response.data);
      } catch (error) {
        console.error("Error cargando estadísticas", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedYear]); // Se vuelve a ejecutar cuando selectedYear cambie

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  // Mapeo de tarjetas (se mantiene igual, pero ahora los datos dependen del filtro)
  const stats = [
    {
      label: "CLIENTES ACTIVOS",
      value: data?.resumen?.clientes || 0,
      subValue: `${data?.resumen?.vendedores || 0} Vendedores`,
      color: "#4facfe",
      icon: "pi-users",
    },
    {
      label: "FACTURACIÓN TOTAL",
      value: formatCurrency(data?.finanzas?.total_facturado),
      subValue: `Ventas registradas en ${selectedYear}`,
      color: "#4dfb97",
      icon: "pi-money-bill",
    },
    {
      label: "RECAUDO",
      value: formatCurrency(data?.finanzas?.total_recaudado),
      subValue: `${(data?.finanzas?.porcentaje_recaudo || 0).toFixed(
        1
      )}% de efectividad`,
      color: "#feb47b",
      icon: "pi-percentage",
    },
    {
      label: "CARTERA PENDIENTE",
      value: formatCurrency(data?.finanzas?.cartera_pendiente),
      subValue: "Cobros por realizar",
      color: "#f75c5c",
      icon: "pi-calendar-times",
    },
  ];

  return (
    <div className="grid">
      {/* Cabecera con Título y Selector */}
      <div className="col-12 mt-2 mb-4 flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2 className="text-white font-light m-0">
            Estado <span className="font-bold text-blue-400">Financiero</span>
          </h2>
          <small className="text-gray-500">
            Información de Exógena {selectedYear}
          </small>
        </div>

        <div className="flex align-items-center gap-3">
          <span className="text-gray-400 text-sm hidden sm:inline">
            Filtrar por:
          </span>
          <Dropdown
            value={selectedYear}
            options={years}
            onChange={(e) => setSelectedYear(e.value)}
            placeholder="Seleccionar Año"
            className="w-full md:w-12rem"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid col-12 p-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="col-12 sm:col-6 lg:col-3">
              <Skeleton height="120px" borderRadius="12px" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Tarjetas de Estadísticas */}
          {stats.map((item, index) => (
            <div key={index} className="col-12 sm:col-6 lg:col-3">
              <div
                className="p-3 shadow-4 border-round-xl"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderLeft: `4px solid ${item.color}`,
                  backdropFilter: "blur(10px)",
                  height: "100%",
                }}
              >
                <div className="flex align-items-center mb-3">
                  <i
                    className={`pi ${item.icon} mr-2`}
                    style={{ color: item.color, fontSize: "0.9rem" }}
                  ></i>
                  <span
                    className="text-xs font-bold tracking-wider"
                    style={{ color: item.color }}
                  >
                    {item.label}
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {item.value}
                  </div>
                  <div className="text-xs text-gray-400 font-medium">
                    {item.subValue}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Sección de Gráfica (Placeholder) */}
          <div className="col-12 mt-4">
            <div
              className="p-4 border-round-xl"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <h3 className="text-white font-light mb-4">
                Ventas por Año Gravable
              </h3>
              <div className="flex align-items-center justify-content-center h-10rem border-1 border-white-alpha-10 border-dashed border-round text-center">
                <span className="text-gray-500">
                  Total Histórico en {selectedYear}: <br />
                  <span className="text-white text-xl font-bold">
                    {formatCurrency(data?.finanzas?.total_facturado)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
