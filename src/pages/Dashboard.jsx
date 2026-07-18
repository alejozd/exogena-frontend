import React, { useEffect, useState, useRef } from "react";
import { dashboardService } from "../services";
import { Skeleton } from "primereact/skeleton";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { Chart } from "primereact/chart";
import { MeterGroup } from "primereact/metergroup";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 1);
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const navigate = useNavigate();
  const toast = useRef(null);

  const years = Array.from(
    { length: new Date().getFullYear() - 2023 + 1 },
    (_, i) => ({ label: `Año ${2023 + i}`, value: 2023 + i }),
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const prepareChart = (facturado, recaudado) => {
    const dataConfig = {
      labels: ["Análisis Financiero"],
      datasets: [
        {
          label: "Facturado",
          backgroundColor: "#60A5FA",
          data: [facturado],
        },
        {
          label: "Recaudado",
          backgroundColor: "#34D399",
          data: [recaudado],
        },
      ],
    };

    const optionsConfig = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: { labels: { color: "#9ca3af", font: { size: 12 } } },
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(255, 255, 255, 0.05)" },
        },
      },
    };

    setChartData(dataConfig);
    setChartOptions(optionsConfig);
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getStats(selectedYear);
        setData(response.data);
        // Configuramos el gráfico con los nuevos datos
        prepareChart(
          response.data.finanzas.total_facturado,
          response.data.finanzas.total_recaudado,
        );
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail:
            "No se pudieron cargar las estadísticas: " +
            (error.response?.data?.error || error.message),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedYear]);

  const getMeterData = () => {
    const total = data?.finanzas?.total_facturado || 1;
    const recaudado = data?.finanzas?.total_recaudado || 0;
    const pendiente = data?.finanzas?.cartera_pendiente || 0;

    return [
      {
        label: "Recaudado",
        value: Number(((recaudado * 100) / total).toFixed(1)),
        color: "#34D399",
        icon: "pi pi-check-circle",
      },
      {
        label: "Pendiente",
        value: Number(((pendiente * 100) / total).toFixed(1)),
        color: "#F87171",
        icon: "pi pi-clock",
      },
    ];
  };

  const stats = [
    {
      label: "CLIENTES ACTIVOS",
      value: data?.resumen?.clientes || 0,
      subValue: `${data?.resumen?.vendedores || 0} Vendedores`,
      color: "#60A5FA",
      icon: "pi-users",
      route: "/clientes",
    },
    {
      label: "FACTURACIÓN TOTAL",
      value: formatCurrency(data?.finanzas?.total_facturado),
      subValue: `Ventas registradas`,
      color: "#34D399",
      icon: "pi-money-bill",
      route: "/ventas",
    },
    {
      label: "RECAUDO",
      value: formatCurrency(data?.finanzas?.total_recaudado),
      subValue: `${data?.finanzas?.porcentaje_recaudo?.toFixed(
        1,
      )}% efectividad`,
      color: "#FB923C",
      icon: "pi-percentage",
      route: "/pagos",
    },
    {
      label: "CARTERA PENDIENTE",
      value: formatCurrency(data?.finanzas?.cartera_pendiente),
      subValue: "Cobros pendientes",
      color: "#F87171",
      icon: "pi-calendar-times",
      route: "/ventas",
    },
  ];

  return (
    <div className="grid p-2">
      <Toast ref={toast} />
      <div className="col-12 mb-2 flex justify-content-between align-items-center flex-wrap gap-3">
        <div style={{ color: "#f49a0a" }}>
          <h2 className="font-light m-0">
            Estado <span className="font-bold text-blue-400">Financiero</span>
          </h2>
          <small className="text-gray-500">Exógena {selectedYear}</small>
        </div>
        <Dropdown
          value={selectedYear}
          options={years}
          onChange={(e) => setSelectedYear(e.value)}
          className="w-full md:w-12rem custom-dropdown"
        />
      </div>

      {loading ? (
        <div className="grid col-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="col-12 sm:col-6 lg:col-3">
              <Skeleton height="120px" borderRadius="12px" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {stats.map((item, index) => (
            <div key={index} className="col-12 sm:col-6 lg:col-3">
              <div
                className="p-3 shadow-4 border-round-xl stat-card"
                style={{ "--card-color": item.color }}
                onClick={() => navigate(item.route)}
              >
                <div className="flex align-items-center mb-3">
                  <i
                    className={`pi ${item.icon} mr-2`}
                    style={{ color: item.color }}
                  ></i>
                  <span
                    className="text-xs font-bold"
                    style={{ color: item.color }}
                  >
                    {item.label}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {item.value}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {item.subValue}
                </div>
              </div>
            </div>
          ))}

          <div className="col-12 lg:col-7 mt-4">
            <div className="p-4 border-round-xl chart-container h-full">
              <h3 className="text-white font-light mb-4">
                Tendencia de Ventas
              </h3>
              <Chart
                type="bar"
                data={chartData}
                options={chartOptions}
                className="h-20rem"
              />
            </div>
          </div>

          <div className="col-12 lg:col-5 mt-4">
            <div className="p-4 border-round-xl chart-container h-full">
              <h3 className="text-white font-light mb-5">
                Composición de Cartera
              </h3>
              <div className="mb-5">
                <div className="text-4xl font-bold text-white">
                  {formatCurrency(data?.finanzas?.total_facturado)}
                </div>
                <p className="text-gray-500 text-sm">
                  Distribución de ingresos
                </p>
              </div>

              <MeterGroup values={getMeterData()} labelOrientation="vertical" />

              <div className="mt-6 p-3 border-round bg-blue-900-alpha-10 border-1 border-blue-900-alpha-30">
                <div className="flex align-items-center gap-2 text-blue-300">
                  <i className="pi pi-info-circle"></i>
                  <span className="text-sm">
                    Faltan{" "}
                    <strong>
                      {formatCurrency(data?.finanzas?.cartera_pendiente)}
                    </strong>{" "}
                    por recaudar.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
