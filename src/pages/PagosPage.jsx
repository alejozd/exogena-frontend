import React, { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { FilterMatchMode } from "primereact/api";

export const PagosPage = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Persistencia del año (Igual que en Ventas)
  const [anoFiltro, setAnoFiltro] = useState(() => {
    const persistido = localStorage.getItem("pagos_filtro_ano");
    return persistido ? parseInt(persistido) : new Date().getFullYear();
  });

  // 2. Estados para Filtro Global
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const toast = useRef(null);

  // Opciones de años (Dinámico o estático según prefieras)
  const opcionesAnos = [
    { label: "2024", value: 2024 },
    { label: "2025", value: 2025 },
    { label: "2026", value: 2026 },
    { label: "2027", value: 2027 },
  ];

  const fetchPagos = async () => {
    setLoading(true);
    try {
      // Guardamos la preferencia del usuario
      localStorage.setItem("pagos_filtro_ano", anoFiltro);

      const { data } = await api.get(`/pagos`, { params: { ano: anoFiltro } });
      setPagos(data);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          "No se pudieron cargar los pagos: " +
          (error.response?.data?.error || error.message),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, [anoFiltro]);

  // Manejador del filtro global
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  // --- Funciones de Formato ---
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // --- Header Template (Siguiendo el estilo de Ventas) ---
  const renderHeader = () => {
    return (
      <div className="flex flex-wrap gap-3 justify-content-between align-items-center">
        <div className="flex align-items-center gap-3">
          <h2 className="m-0 font-light" style={{ color: "#3B82F6" }}>
            Historial de{" "}
            <span className="font-bold text-blue-400">Recaudos</span>
          </h2>
          <Dropdown
            value={anoFiltro}
            options={opcionesAnos}
            onChange={(e) => setAnoFiltro(e.value)}
            placeholder="Año"
            className="p-inputtext-sm"
          />
        </div>
        <div className="flex gap-2">
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Buscar por cliente, método..."
              className="p-inputtext-sm w-full md:w-15rem"
            />
          </IconField>
          <Button
            label="Exportar"
            icon="pi pi-file-excel"
            severity="info"
            className="p-button-sm"
            outlined
          />
        </div>
      </div>
    );
  };

  return (
    <div className="card shadow-2 p-3 border-round-xl bg-gray-900-alpha-10 mt-3">
      <Toast ref={toast} />

      <DataTable
        value={pagos}
        loading={loading}
        header={renderHeader()}
        filters={filters}
        // Definimos sobre qué campos busca el filtro global
        globalFilterFields={[
          "ventas.clientes.razon_social",
          "ventas.clientes.nit",
          "metodo_pago",
          "observaciones",
        ]}
        paginator
        rows={10}
        className="p-datatable-sm"
        stripedRows
        emptyMessage={`No hay pagos registrados para el año ${anoFiltro}`}
      >
        <Column field="id" header="ID" sortable style={{ width: "5%" }} />
        <Column
          header="Fecha"
          field="fecha_pago"
          body={(rd) => new Date(rd.fecha_pago).toLocaleDateString()}
          sortable
          style={{ width: "12%" }}
        />
        <Column
          header="Cliente"
          sortable
          field="ventas.clientes.razon_social"
          body={(rd) => (
            <div>
              <div className="font-bold">
                {rd.ventas?.clientes?.razon_social}
              </div>
              <small className="text-blue-400">
                {rd.ventas?.seriales_erp?.nombre_software}
              </small>
            </div>
          )}
          style={{ width: "30%" }}
        />
        <Column
          header="Método"
          field="metodo_pago"
          sortable
          body={(rd) => (
            <Tag
              value={rd.metodo_pago.toUpperCase()}
              severity={
                rd.metodo_pago === "transferencia" ? "success" : "warning"
              }
              outlined
            />
          )}
          style={{ width: "15%" }}
        />
        <Column
          header="Monto Pagado"
          field="monto_pagado"
          sortable
          body={(rd) => (
            <span className="font-bold text-green-400">
              {formatCurrency(rd.monto_pagado)}
            </span>
          )}
          textAlign="right"
          style={{ width: "15%" }}
        />
        <Column
          field="observaciones"
          header="Obs."
          body={(rd) => (
            <small className="text-gray-500">{rd.observaciones || "-"}</small>
          )}
        />
      </DataTable>
    </div>
  );
};
