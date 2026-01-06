import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { FilterMatchMode } from "primereact/api";
import api from "../api/axios";

export const ActivacionesPage = () => {
  const [activaciones, setActivaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const toast = useRef(null);

  useEffect(() => {
    loadActivaciones();
  }, []);

  const loadActivaciones = async () => {
    setLoading(true);
    try {
      const response = await api.get("/activaciones");
      setActivaciones(response.data);
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail:
          "No se pudieron cargar las activaciones " + e.response?.data?.error,
        life: 3000,
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

  const confirmDelete = (id) => {
    confirmDialog({
      message: "¿Estás seguro de eliminar este registro de activación?",
      header: "Confirmación de Eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => deleteActivacion(id),
    });
  };

  const deleteActivacion = async (id) => {
    try {
      await api.delete(`/activaciones/${id}`);
      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Registro eliminado correctamente",
        life: 3000,
      });
      loadActivaciones();
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error al eliminar: " + (e.response?.data?.error || e.message),
        life: 3000,
      });
    }
  };

  // Plantillas para las columnas
  const dateBodyTemplate = (rowData) => {
    return new Date(rowData.fecha_activacion).toLocaleString();
  };

  const clienteBodyTemplate = (rowData) => (
    <div>
      <div className="font-bold text-blue-100">
        {rowData.ventas?.clientes?.razon_social || "N/A"}
      </div>
      <small className="text-gray-400">
        NIT: {rowData.ventas?.clientes?.nit}
      </small>
    </div>
  );

  const softwareBodyTemplate = (rowData) => (
    <div>
      <div className="text-yellow-500 font-medium">
        {rowData.ventas?.seriales_erp?.nombre_software}
      </div>
      <small className="font-mono">
        {rowData.ventas?.seriales_erp?.serial_erp}
      </small>
    </div>
  );

  const equipoBodyTemplate = (rowData) => (
    <div>
      <div className="text-gray-100">{rowData.nombre_equipo}</div>
      <code className="text-xs text-green-400 bg-gray-800 px-1 rounded">
        {rowData.mac_servidor}
      </code>
    </div>
  );

  const actionBodyTemplate = (rowData) => (
    <Button
      icon="pi pi-trash"
      rounded
      outlined
      severity="danger"
      onClick={() => confirmDelete(rowData.id)}
    />
  );

  const renderHeader = () => (
    <div className="flex flex-wrap gap-2 justify-content-between align-items-center">
      <h2 className="m-0 text-yellow font-light" style={{ color: "#27eedeff" }}>
        Historial de <span className="font-bold">Activaciones</span>
      </h2>
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Buscar por MAC, Cliente o Serial..."
          className="p-inputtext-sm w-full md:w-20rem"
        />
      </IconField>
    </div>
  );

  return (
    <div className="card shadow-2 p-3 border-round-xl bg-gray-900-alpha-10">
      <Toast ref={toast} />
      <ConfirmDialog />

      <DataTable
        value={activaciones}
        loading={loading}
        stripedRows
        paginator
        rows={10}
        header={renderHeader()}
        filters={filters}
        globalFilterFields={[
          "nombre_equipo",
          "mac_servidor",
          "ventas.clientes.razon_social",
          "ventas.seriales_erp.serial_erp",
          "ip_origen",
        ]}
        className="p-datatable-sm"
        emptyMessage="No se encontraron registros de activación."
      >
        <Column
          header="Fecha/Hora"
          body={dateBodyTemplate}
          sortable
          field="fecha_activacion"
        />
        <Column header="Cliente" body={clienteBodyTemplate} />
        <Column header="Software / Serial" body={softwareBodyTemplate} />
        <Column header="Equipo / MAC" body={equipoBodyTemplate} />
        <Column field="ip_origen" header="IP Origen" />
        <Column
          body={actionBodyTemplate}
          exportable={false}
          style={{ width: "80px" }}
          textAlign="center"
        />
      </DataTable>
    </div>
  );
};

export default ActivacionesPage;
