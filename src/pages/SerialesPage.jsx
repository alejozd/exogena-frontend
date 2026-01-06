import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
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

  // Función para manejar la búsqueda
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
      // Formateamos clientes para que el dropdown muestre "NIT - Nombre"
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
        detail: "Todos los campos son obligatorios",
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
        detail: e.response?.data?.error || "Error al guardar",
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

  const leftToolbarTemplate = () => (
    <Button
      label="Registrar Serial"
      icon="pi pi-key"
      severity="success"
      onClick={() => {
        setSerial(emptySerial);
        setSerialDialog(true);
      }}
    />
  );

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

  // Cabecera de la tabla con el buscador
  const renderHeader = () => {
    return (
      <div className="flex justify-content-between align-items-center">
        <h2 className="text-white m-0 font-light">
          Control de{" "}
          <span className="font-bold text-yellow-400">Seriales ERP</span>
        </h2>
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Buscar por Serial, Cliente o NIT..."
            className="p-inputtext-sm w-full md:w-20rem"
          />
        </IconField>
      </div>
    );
  };

  const header = renderHeader();

  return (
    <div className="card shadow-2 p-4 border-round-xl bg-gray-900-alpha-10">
      <Toast ref={toast} />
      <ConfirmDialog />
      <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

      <DataTable
        value={seriales}
        loading={loading}
        stripedRows
        paginator
        rows={10}
        header={header} // Agregamos la cabecera con el buscador
        filters={filters} // Aplicamos los filtros
        globalFilterFields={[
          "serial_erp",
          "nombre_software",
          "clientes.razon_social",
          "clientes.nit",
        ]} // CAMPOS DONDE BUSCAR
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
              <div className="font-bold">{rowData.clientes?.razon_social}</div>
              <small className="text-gray-400">
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
        <Column body={actionBodyTemplate} exportable={false}></Column>
      </DataTable>

      <Dialog
        visible={serialDialog}
        header={serial.id ? "Editar Serial" : "Nuevo Registro de Serial"}
        modal
        className="p-fluid"
        style={{ width: "450px" }}
        onHide={() => setSerialDialog(false)}
        footer={
          <>
            <Button
              label="Cancelar"
              icon="pi pi-times"
              text
              onClick={() => setSerialDialog(false)}
            />
            <Button
              label="Guardar Serial"
              icon="pi pi-check"
              onClick={saveSerial}
            />
          </>
        }
      >
        <div className="field mb-3">
          <label className="font-bold">Cliente</label>
          <Dropdown
            value={serial.cliente_id}
            options={clientes}
            onChange={(e) => setSerial({ ...serial, cliente_id: e.value })}
            placeholder="Seleccione un cliente"
            filter // Habilita la búsqueda por texto
            showClear
          />
        </div>
        <div className="field mb-3">
          <label className="font-bold">Nombre del Software</label>
          <InputText
            value={serial.nombre_software}
            onChange={(e) =>
              setSerial({ ...serial, nombre_software: e.target.value })
            }
            placeholder="Ej: Siigo, Helisa, SAP..."
          />
        </div>
        <div className="field mb-3">
          <label className="font-bold">Número de Serial</label>
          <InputText
            value={serial.serial_erp}
            onChange={(e) =>
              setSerial({ ...serial, serial_erp: e.target.value })
            }
            placeholder="Ingrese el código de licencia"
          />
        </div>
        <div className="field flex align-items-center gap-3">
          <label className="font-bold">¿Serial Habilitado?</label>
          <InputSwitch
            checked={serial.activo}
            onChange={(e) => setSerial({ ...serial, activo: e.value })}
          />
        </div>
      </Dialog>
    </div>
  );
};
