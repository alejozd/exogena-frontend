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
import { Dropdown } from "primereact/dropdown";
import { activacionesService } from "../services";

export const ActivacionesPage = () => {
  const ALL_YEARS_VALUE = "ALL";
  const [activaciones, setActivaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [anosOptions, setAnosOptions] = useState([
    { label: "Todos los años", value: ALL_YEARS_VALUE },
  ]); // Nuevo: opciones dinámicas
  const toast = useRef(null);

  useEffect(() => {
    loadActivaciones();
  }, []);

  const loadActivaciones = async () => {
    setLoading(true);
    try {
      const response = await activacionesService.getAll();
      setActivaciones(response.data);

      // Extraer años gravables únicos y ordenarlos descendente
      const uniqueAnos = [
        ...new Set(
          response.data
            .map((item) => item.ventas?.ano_gravable)
            .filter((a) => a != null),
        ),
      ].sort((a, b) => b - a);
      const options = uniqueAnos.map((ano) => ({
        label: `Medios ${ano}`,
        value: ano,
      }));
      setAnosOptions([
        { label: "Todos los años", value: ALL_YEARS_VALUE },
        ...options,
      ]);

      // Nuevo: Filtro por defecto al año más reciente (ej., 2025 en 2026)
      if (uniqueAnos.length > 0) {
        const latestAno = uniqueAnos[0];
        setFilters((prevFilters) => ({
          ...prevFilters,
          "ventas.ano_gravable": {
            value: latestAno,
            matchMode: FilterMatchMode.EQUALS,
          },
        }));
      }
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
      await activacionesService.delete(id);
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

  // Modificado: Colores basados en el año actual (new Date().getFullYear() - 1)
  const anoGravableBodyTemplate = (rowData) => {
    const ano = rowData.ventas?.ano_gravable;
    if (!ano) return <span style={{ color: "#888" }}>N/A</span>;

    const currentAno = new Date().getFullYear() - 1; // Ej., 2025 en 2026
    const isCurrent = ano === currentAno;
    const style = {
      backgroundColor: isCurrent ? "#27eedeff" : "#64748b", // Turquesa para actual, gris para anteriores
      color: isCurrent ? "#000000" : "#ffffff",
      fontWeight: "bold",
      padding: "4px 10px",
      borderRadius: "4px",
      fontSize: "0.8rem",
      display: "inline-block",
      minWidth: "60px",
      textAlign: "center",
      boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
    };

    return <span style={style}>{ano}</span>;
  };

  // Nuevo: Plantilla para ano_venta
  const anoVentaBodyTemplate = (rowData) => {
    const ano = rowData.ventas?.ano_venta;
    return ano ? (
      <span>{ano}</span>
    ) : (
      <span style={{ color: "#888" }}>N/A</span>
    );
  };

  // Plantillas para las columnas (resto igual)
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

  const renderHeader = () => {
    return (
      <div className="flex flex-wrap gap-2 justify-content-between align-items-center">
        <h2 className="m-0 font-light" style={{ color: "#27eedeff" }}>
          Historial de <span className="font-bold">Activaciones</span>
          {filters["ventas.ano_gravable"]?.value && (
            <span
              style={{ fontSize: "0.9rem", opacity: 0.7, marginLeft: "12px" }}
            >
              (Mostrando solo Medios {filters["ventas.ano_gravable"].value})
            </span>
          )}
        </h2>

        <div className="flex gap-2">
          <Dropdown
            value={
              filters["ventas.ano_gravable"]
                ? filters["ventas.ano_gravable"].value
                : ALL_YEARS_VALUE
            }
            options={anosOptions}
            onChange={(e) => {
              setFilters((current) => {
                const updated = { ...current };

                if (e.value === ALL_YEARS_VALUE) {
                  delete updated["ventas.ano_gravable"];
                } else {
                  updated["ventas.ano_gravable"] = {
                    value: e.value,
                    matchMode: FilterMatchMode.EQUALS,
                  };
                }
                return updated;
              });
            }}
            placeholder="Filtrar por Año"
            className="p-inputtext-sm"
            style={{ width: "160px" }}
          />

          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Buscar..."
              className="p-inputtext-sm w-full md:w-15rem"
            />
          </IconField>
        </div>
      </div>
    );
  };

  return (
    <div className="card shadow-2 p-3 border-round-xl bg-gray-900">
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
        sortField="fecha_activacion"
        sortOrder={-1}
        className="p-datatable-sm"
        emptyMessage="No se encontraron registros de activación."
      >
        <Column
          header="Fecha/Hora"
          body={dateBodyTemplate}
          sortable
          field="fecha_activacion"
        />
        <Column
          header="Año Gravable"
          body={anoGravableBodyTemplate}
          sortable
          field="ventas.ano_gravable"
        />
        {/* Nuevo: Columna para Año de Venta */}
        <Column
          header="Año Venta"
          body={anoVentaBodyTemplate}
          sortable
          field="ventas.ano_venta"
        />
        <Column header="Cliente" body={clienteBodyTemplate} />
        <Column header="Software / Serial" body={softwareBodyTemplate} />
        <Column header="Equipo / MAC" body={equipoBodyTemplate} />
        <Column field="ip_origen" header="IP Origen" />
        <Column
          body={actionBodyTemplate}
          style={{ width: "80px" }}
          textAlign="center"
        />
      </DataTable>
    </div>
  );
};

export default ActivacionesPage;
