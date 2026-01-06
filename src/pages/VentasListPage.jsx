import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { FilterMatchMode } from "primereact/api";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export const VentasListPage = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear());
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const navigate = useNavigate();
  const toast = useRef(null);

  // Generar lista de años (ej: desde 2020 hasta el actual + 1)
  const anosOptions = Array.from({ length: 10 }, (_, i) => ({
    label: `${2022 + i}`,
    value: 2022 + i,
  }));

  useEffect(() => {
    fetchVentas();
  }, [anoFiltro]);

  const fetchVentas = async () => {
    setLoading(true);
    try {
      // Pasamos el año actual del estado como query param
      const res = await api.get(`/ventas`, { params: { ano: anoFiltro } });
      setVentas(res.data);
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error al cargar ventas " + e.response?.data?.error,
      });
    } finally {
      setLoading(false);
    }
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const formatCurrency = (value) => {
    return value.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
    });
  };

  // Templates para la tabla
  const statusBodyTemplate = (rowData) => {
    const { esta_paga, saldo_pendiente } = rowData.resumen_financiero;
    if (esta_paga) return <Tag value="PAGADO" severity="success" />;
    if (saldo_pendiente <= 0) return <Tag value="SALDO $0" severity="info" />;
    return <Tag value="PENDIENTE" severity="warning" />;
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-wrap gap-3 justify-content-between align-items-center">
        <div className="flex align-items-center gap-3">
          <h2 className="m-0 text-white font-light">
            Registro de <span className="font-bold text-green-400">Ventas</span>
          </h2>
          <Dropdown
            value={anoFiltro}
            options={anosOptions}
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
              placeholder="Cliente, Serial o Vendedor..."
              className="p-inputtext-sm w-full md:w-15rem"
            />
          </IconField>
          <Button
            label="Nueva Venta"
            icon="pi pi-cart-plus"
            severity="success"
            className="p-button-sm"
            onClick={() => navigate("/ventas/nueva")}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="card shadow-2 p-3 border-round-xl bg-gray-900-alpha-10">
      <Toast ref={toast} />

      <DataTable
        value={ventas}
        loading={loading}
        header={renderHeader()}
        filters={filters}
        globalFilterFields={[
          "clientes.razon_social",
          "clientes.nit",
          "seriales_erp.serial_erp",
          "vendedores.nombre",
        ]}
        paginator
        rows={10}
        className="p-datatable-sm"
        stripedRows
      >
        <Column
          header="Fecha"
          body={(rd) => new Date(rd.fecha_venta).toLocaleDateString()}
          sortable
          field="fecha_venta"
        />
        <Column
          header="Cliente"
          sortable
          field="clientes.razon_social"
          body={(rd) => (
            <div>
              <div className="font-bold">{rd.clientes.razon_social}</div>
              <small className="text-gray-500">
                {rd.seriales_erp.nombre_software}: {rd.seriales_erp.serial_erp}
              </small>
            </div>
          )}
        />
        <Column
          header="Valor Total"
          body={(rd) => formatCurrency(rd.valor_total)}
          textAlign="right"
        />
        <Column
          header="Saldo"
          body={(rd) => (
            <span
              className={
                rd.resumen_financiero.saldo_pendiente > 0
                  ? "text-red-400 font-bold"
                  : "text-green-400"
              }
            >
              {formatCurrency(rd.resumen_financiero.saldo_pendiente)}
            </span>
          )}
          textAlign="right"
        />
        <Column header="Estado" body={statusBodyTemplate} textAlign="center" />
        <Column
          body={(rd) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-eye"
                rounded
                outlined
                severity="info"
                onClick={() => navigate(`/ventas/detalle/${rd.id}`)}
              />
              <Button
                icon="pi pi-pencil"
                rounded
                outlined
                onClick={() => navigate(`/ventas/editar/${rd.id}`)}
              />
            </div>
          )}
        />
      </DataTable>
    </div>
  );
};
