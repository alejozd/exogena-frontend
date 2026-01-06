import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { InputSwitch } from "primereact/inputswitch";
import { Toast } from "primereact/toast";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { FilterMatchMode } from "primereact/api";
import api from "../api/axios";

export const VendedoresPage = () => {
  const [vendedores, setVendedores] = useState([]);
  const [vendedorDialog, setVendedorDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const toast = useRef(null);

  const emptyVendedor = {
    nombre: "",
    email: "",
    telefono: "",
    activo: true,
  };

  const [vendedor, setVendedor] = useState(emptyVendedor);

  useEffect(() => {
    loadVendedores();
  }, []);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const loadVendedores = async () => {
    setLoading(true);
    try {
      const res = await api.get("/vendedores");
      setVendedores(res.data);
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar la lista " + e.response?.data?.error,
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const saveVendedor = async () => {
    if (!vendedor.nombre || !vendedor.email) {
      toast.current.show({
        severity: "warn",
        summary: "Atención",
        detail: "Nombre y Email son obligatorios",
        life: 3000,
      });
      return;
    }

    try {
      if (vendedor.id) {
        await api.put(`/vendedores/${vendedor.id}`, vendedor);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Vendedor actualizado",
          life: 3000,
        });
      } else {
        await api.post("/vendedores", vendedor);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Vendedor creado",
          life: 3000,
        });
      }
      setVendedorDialog(false);
      loadVendedores();
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: e.response?.data?.error || "Error al guardar",
        life: 3000,
      });
    }
  };

  const editVendedor = (v) => {
    setVendedor({ ...v });
    setVendedorDialog(true);
  };

  const statusBodyTemplate = (rowData) => (
    <Tag
      value={rowData.activo ? "ACTIVO" : "INACTIVO"}
      severity={rowData.activo ? "success" : "danger"}
    />
  );

  const actionBodyTemplate = (rowData) => (
    <Button
      icon="pi pi-pencil"
      rounded
      outlined
      onClick={() => editVendedor(rowData)}
    />
  );

  const renderHeader = () => {
    return (
      <div className="flex flex-wrap gap-2 justify-content-between align-items-center">
        <h2 className="m-0 font-light" style={{ color: "#3B82F6" }}>
          Gestión de <span className="font-bold text-blue-400">Vendedores</span>
        </h2>
        <div className="flex gap-2">
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Buscar vendedor..."
              className="p-inputtext-sm w-full md:w-15rem"
            />
          </IconField>
          <Button
            label="Nuevo"
            icon="pi pi-plus"
            severity="success"
            className="p-button-sm"
            onClick={() => {
              setVendedor(emptyVendedor);
              setVendedorDialog(true);
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

      <DataTable
        value={vendedores}
        loading={loading}
        header={header}
        filters={filters}
        globalFilterFields={["nombre", "email", "telefono"]}
        paginator
        rows={10}
        className="p-datatable-sm"
        stripedRows
        emptyMessage="No se encontraron vendedores."
      >
        <Column field="nombre" header="Nombre" sortable></Column>
        <Column field="email" header="Email" sortable></Column>
        <Column field="telefono" header="Teléfono"></Column>
        <Column
          field="_count.clientes"
          header="Clientes"
          textAlign="center"
          sortable
        ></Column>
        <Column
          header="Estado"
          body={statusBodyTemplate}
          textAlign="center"
        ></Column>
        <Column
          body={actionBodyTemplate}
          exportable={false}
          style={{ width: "80px" }}
        ></Column>
      </DataTable>

      <Dialog
        visible={vendedorDialog}
        header={vendedor.id ? "Editar Vendedor" : "Nuevo Vendedor"}
        modal
        className="p-fluid"
        style={{ width: "400px" }}
        onHide={() => setVendedorDialog(false)}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              severity="danger"
              text
              onClick={() => setVendedorDialog(false)}
            />
            <Button
              label="Guardar"
              icon="pi pi-check"
              severity="success"
              onClick={saveVendedor}
            />
          </div>
        }
      >
        <div className="field mb-4">
          <label htmlFor="nombre" className="font-bold block mb-2">
            Nombre
          </label>
          <InputText
            id="nombre"
            value={vendedor.nombre}
            onChange={(e) =>
              setVendedor({ ...vendedor, nombre: e.target.value })
            }
            autoFocus
          />
        </div>

        <div className="field mb-4">
          <label htmlFor="email" className="font-bold block mb-2">
            Email
          </label>
          <InputText
            id="email"
            value={vendedor.email}
            onChange={(e) =>
              setVendedor({ ...vendedor, email: e.target.value })
            }
          />
        </div>

        <div className="field mb-4">
          <label htmlFor="telefono" className="font-bold block mb-2">
            Teléfono
          </label>
          <InputText
            id="telefono"
            value={vendedor.telefono || ""}
            onChange={(e) =>
              setVendedor({ ...vendedor, telefono: e.target.value })
            }
          />
        </div>

        <div className="field flex align-items-center gap-3">
          <label htmlFor="activo" className="font-bold">
            ¿Activo?
          </label>
          <InputSwitch
            id="activo"
            checked={vendedor.activo}
            onChange={(e) => setVendedor({ ...vendedor, activo: e.value })}
          />
          <Tag
            value={vendedor.activo ? "SÍ" : "NO"}
            severity={vendedor.activo ? "success" : "danger"}
          />
        </div>
      </Dialog>
    </div>
  );
};
