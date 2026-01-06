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
import { Toast } from "primereact/toast"; // Importante
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog"; // Más elegante que window.confirm
import api from "../api/axios";

export const ClientesPage = () => {
  const [clientes, setClientes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [clienteDialog, setClienteDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useRef(null); // Referencia para el Toast

  const emptyCliente = {
    nit: "",
    razon_social: "",
    email: "",
    telefono: "",
    direccion: "",
    vendedor_id: null,
    activo: true,
  };

  const [cliente, setCliente] = useState(emptyCliente);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resClientes, resVendedores] = await Promise.all([
        api.get("/clientes"),
        api.get("/vendedores"),
      ]);
      setClientes(resClientes.data);
      setVendedores(resVendedores.data);
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron cargar los datos " + e.response?.data?.error,
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCliente = async () => {
    // Validación básica antes de enviar
    if (!cliente.nit || !cliente.razon_social) {
      toast.current.show({
        severity: "warn",
        summary: "Atención",
        detail: "NIT y Razón Social son obligatorios",
        life: 3000,
      });
      return;
    }

    try {
      if (cliente.id) {
        await api.put(`/clientes/${cliente.id}`, cliente);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Cliente actualizado",
          life: 3000,
        });
      } else {
        await api.post("/clientes", cliente);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Cliente creado",
          life: 3000,
        });
      }
      setClienteDialog(false);
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
      message: "¿Estás seguro de eliminar este cliente?",
      header: "Confirmar Eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sí, eliminar",
      rejectLabel: "No",
      acceptClassName: "p-button-danger",
      accept: () => deleteCliente(id),
    });
  };

  const deleteCliente = async (id) => {
    try {
      await api.delete(`/clientes/${id}`);
      toast.current.show({
        severity: "success",
        summary: "Eliminado",
        detail: "Cliente borrado correctamente",
        life: 3000,
      });
      loadData();
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo eliminar el cliente " + e.response?.data?.error,
        life: 3000,
      });
    }
  };

  const editCliente = (c) => {
    // Aseguramos que el vendedor_id sea un número para el Dropdown
    setCliente({
      ...c,
      vendedor_id: c.vendedor_id ? Number(c.vendedor_id) : null,
    });
    setClienteDialog(true);
  };

  const leftToolbarTemplate = () => (
    <Button
      label="Nuevo Cliente"
      icon="pi pi-plus"
      severity="success"
      onClick={() => {
        setCliente(emptyCliente);
        setClienteDialog(true);
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
        onClick={() => editCliente(rowData)}
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

  return (
    <div className="card shadow-2 p-4 border-round-xl bg-gray-900-alpha-10">
      <Toast ref={toast} />
      <ConfirmDialog />

      <h2 className="text-white font-light">
        Gestión de <span className="font-bold text-blue-400">Clientes</span>
      </h2>

      <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

      <DataTable
        value={clientes}
        loading={loading}
        stripedRows
        className="p-datatable-sm"
        paginator
        rows={10}
      >
        <Column field="nit" header="NIT" sortable></Column>
        <Column field="razon_social" header="Razón Social" sortable></Column>
        <Column field="email" header="Email"></Column>
        <Column field="vendedores.nombre" header="Vendedor" sortable></Column>
        <Column
          header="Seriales"
          body={(rowData) => rowData.seriales_erp?.length || 0}
          textAlign="center"
        ></Column>
        <Column header="Estado" body={statusBodyTemplate}></Column>
        <Column body={actionBodyTemplate} exportable={false}></Column>
      </DataTable>

      <Dialog
        visible={clienteDialog}
        header={cliente.id ? "Editar Cliente" : "Nuevo Cliente"}
        modal
        className="p-fluid"
        style={{ width: "500px" }}
        onHide={() => setClienteDialog(false)}
        footer={
          <>
            <Button
              label="Cancelar"
              icon="pi pi-times"
              text
              onClick={() => setClienteDialog(false)}
            />
            <Button label="Guardar" icon="pi pi-check" onClick={saveCliente} />
          </>
        }
      >
        <div className="field mb-3">
          <label className="font-bold">NIT</label>
          <InputText
            value={cliente.nit}
            onChange={(e) => setCliente({ ...cliente, nit: e.target.value })}
          />
        </div>
        <div className="field mb-3">
          <label className="font-bold">Razón Social</label>
          <InputText
            value={cliente.razon_social}
            onChange={(e) =>
              setCliente({ ...cliente, razon_social: e.target.value })
            }
          />
        </div>
        <div className="field mb-3">
          <label className="font-bold">Email</label>
          <InputText
            value={cliente.email}
            onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
          />
        </div>
        <div className="field mb-3">
          <label className="font-bold">Teléfono</label>
          <InputText
            value={cliente.telefono || ""}
            onChange={(e) =>
              setCliente({ ...cliente, telefono: e.target.value })
            }
          />
        </div>
        <div className="field mb-3">
          <label className="font-bold">Dirección</label>
          <InputText
            value={cliente.direccion || ""}
            onChange={(e) =>
              setCliente({ ...cliente, direccion: e.target.value })
            }
          />
        </div>
        <div className="field mb-3">
          <label className="font-bold">Vendedor Asignado</label>
          <Dropdown
            value={cliente.vendedor_id}
            options={vendedores}
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccione un vendedor"
            onChange={(e) => setCliente({ ...cliente, vendedor_id: e.value })}
            showClear
          />
        </div>
        <div className="field flex align-items-center gap-3">
          <label className="font-bold">¿Activo?</label>
          <InputSwitch
            checked={cliente.activo}
            onChange={(e) => setCliente({ ...cliente, activo: e.value })}
          />
          <Tag
            value={cliente.activo ? "SÍ" : "NO"}
            severity={cliente.activo ? "success" : "danger"}
          />
        </div>
      </Dialog>
    </div>
  );
};
