import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
// Quitamos Toolbar de los imports si no se usa en otro lado
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { FilterMatchMode } from "primereact/api";
import api from "../api/axios";

export const SerialesPage = () => {
  const [seriales, setSeriales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [serialDialog, setSerialDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const toast = useRef(null);

  const emptySerial = {
    serial_erp: "",
    nombre_software: "",
    cliente_id: null,
    activo: true,
  };

  const [serial, setSerial] = useState(emptySerial);

  useEffect(() => {
    loadData();
  }, []);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [resSeriales, resClientes] = await Promise.all([
        api.get("/seriales"),
        api.get("/clientes"),
      ]);
      setSeriales(resSeriales.data);
      const clientesFormatted = resClientes.data.map((c) => ({
        label: `${c.nit} - ${c.razon_social}`,
        value: c.id,
      }));
      setClientes(clientesFormatted);
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error al cargar datos " + e.response?.data?.error,
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSerial = async () => {
    if (!serial.serial_erp || !serial.cliente_id || !serial.nombre_software) {
      toast.current.show({
        severity: "warn",
        summary: "Atención",
        detail: "Campos obligatorios",
        life: 3000,
      });
      return;
    }
    try {
      if (serial.id) {
        await api.put(`/seriales/${serial.id}`, serial);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Serial actualizado",
          life: 3000,
        });
      } else {
        await api.post("/seriales", serial);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Serial registrado",
          life: 3000,
        });
      }
      setSerialDialog(false);
      loadData();
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error al guardar " + e.response?.data?.error,
        life: 3000,
      });
    }
  };

  const confirmDelete = (id) => {
    confirmDialog({
      message: "¿Estás seguro de eliminar este serial?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => deleteSerial(id),
    });
  };

  const deleteSerial = async (id) => {
    try {
      await api.delete(`/seriales/${id}`);
      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Serial eliminado",
        life: 3000,
      });
      loadData();
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo eliminar " + e.response?.data?.error,
        life: 3000,
      });
    }
  };

  const statusBodyTemplate = (rowData) => (
    <Tag
      value={rowData.activo ? "ACTIVO" : "INACTIVO"}
      severity={rowData.activo ? "success" : "danger"}
    />
  );

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        outlined
        onClick={() => {
          setSerial({ ...rowData, cliente_id: rowData.cliente_id.toString() });
          setSerialDialog(true);
        }}
      />
      <Button
        icon="pi pi-trash"
        rounded
        outlined
        severity="danger"
        onClick={() => confirmDelete(rowData.id)}
      />
    </div>
  );

  // NUEVO HEADER COMPACTO
  const renderHeader = () => {
    return (
      <div className="flex flex-wrap gap-2 justify-content-between align-items-center">
        <h2 className="m-0 text-yellow font-light" style={{ color: "#FACC15" }}>
          Control de <span className="font-bold">Seriales ERP</span>
        </h2>
        <div className="flex gap-2">
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Buscar..."
              className="p-inputtext-sm w-full md:w-15rem"
            />
          </IconField>
          <Button
            label="Nuevo"
            icon="pi pi-plus"
            severity="success"
            className="p-button-sm"
            onClick={() => {
              setSerial(emptySerial);
              setSerialDialog(true);
            }}
          />
        </div>
      </div>
    );
  };

  const header = renderHeader();

  return (
    <div className="card shadow-2 p-3 border-round-xl bg-gray-900-alpha-10">
      <Toast ref={toast} />
      <ConfirmDialog />

      <DataTable
        value={seriales}
        loading={loading}
        stripedRows
        paginator
        rows={10}
        header={header} // Header compacto con botón integrado
        filters={filters}
        globalFilterFields={[
          "serial_erp",
          "nombre_software",
          "clientes.razon_social",
          "clientes.nit",
        ]}
        className="p-datatable-sm"
        emptyMessage="No se encontraron seriales."
      >
        <Column
          field="serial_erp"
          header="Serial / Licencia"
          sortable
          className="font-mono font-bold"
        ></Column>
        <Column field="nombre_software" header="Software" sortable></Column>
        <Column
          header="Cliente"
          sortable
          sortField="clientes.razon_social"
          body={(rowData) => (
            <div>
              <div className="font-bold text-blue-100">
                {rowData.clientes?.razon_social}
              </div>
              <small className="text-gray-400 font-medium">
                NIT: {rowData.clientes?.nit}
              </small>
            </div>
          )}
        ></Column>
        <Column
          header="Estado"
          body={statusBodyTemplate}
          textAlign="center"
        ></Column>
        <Column
          body={actionBodyTemplate}
          exportable={false}
          style={{ width: "100px" }}
        ></Column>
      </DataTable>

      <Dialog
        visible={serialDialog}
        header={serial.id ? "Editar Serial" : "Nuevo Registro"}
        modal
        className="p-fluid"
        style={{ width: "400px" }}
        onHide={() => setSerialDialog(false)}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              text
              onClick={() => setSerialDialog(false)}
            />
            <Button label="Guardar" icon="pi pi-check" onClick={saveSerial} />
          </div>
        }
      >
        <div className="field mb-3">
          <label className="font-bold">Cliente</label>
          <Dropdown
            value={serial.cliente_id}
            options={clientes}
            onChange={(e) => setSerial({ ...serial, cliente_id: e.value })}
            placeholder="Seleccione cliente"
            filter
            showClear
          />
        </div>
        <div className="field mb-3">
          <label className="font-bold">Software</label>
          <InputText
            value={serial.nombre_software}
            onChange={(e) =>
              setSerial({ ...serial, nombre_software: e.target.value })
            }
          />
        </div>
        <div className="field mb-3">
          <label className="font-bold">Número de Serial</label>
          <InputText
            value={serial.serial_erp}
            onChange={(e) =>
              setSerial({ ...serial, serial_erp: e.target.value })
            }
          />
        </div>
        <div className="field flex align-items-center gap-3">
          <label className="font-bold">Activo</label>
          <InputSwitch
            checked={serial.activo}
            onChange={(e) => setSerial({ ...serial, activo: e.value })}
          />
        </div>
      </Dialog>
    </div>
  );
};
