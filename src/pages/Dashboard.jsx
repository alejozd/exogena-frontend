import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Skeleton } from "primereact/skeleton";

export const Dashboard = () => {
  // Eliminamos const { user } = useAuth(); para quitar el warning
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/dashboard/stats");
        setData(response.data);
      } catch (error) {
        console.error("Error cargando estadísticas", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="col-12 sm:col-6 lg:col-3">
            <Skeleton height="120px" borderRadius="12px" />
          </div>
        ))}
      </div>
    );
  }

  // Mapeo dinámico asegurando que no existan 'undefined'
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
      subValue: "Ventas registradas",
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
      <div className="col-12 mt-2 mb-4">
        <h2 className="text-white font-light m-0">
          Estado <span className="font-bold text-blue-400">Financiero</span>
        </h2>
        <small className="text-gray-500">
          Información actualizada de Exógena 2025
        </small>
      </div>

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
          <div className="flex align-items-center justify-content-center h-10rem border-1 border-white-alpha-10 border-dashed border-round">
            <span className="text-gray-500">
              Datos del{" "}
              {data?.graficas?.ventas_por_ano[0]?.ano_gravable || "N/A"}:{" "}
              {formatCurrency(
                data?.graficas?.ventas_por_ano[0]?._sum?.valor_total
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
