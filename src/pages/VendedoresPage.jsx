import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { InputSwitch } from "primereact/inputswitch";
import api from "../api/axios";

export const VendedoresPage = () => {
  const [vendedores, setVendedores] = useState([]);
  const [vendedorDialog, setVendedorDialog] = useState(false);
  const [vendedor, setVendedor] = useState({
    nombre: "",
    email: "",
    telefono: "",
    activo: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendedores();
  }, []);

  const loadVendedores = async () => {
    try {
      const res = await api.get("/vendedores");
      setVendedores(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveVendedor = async () => {
    try {
      if (vendedor.id) {
        await api.put(`/vendedores/${vendedor.id}`, vendedor);
      } else {
        await api.post("/vendedores", vendedor);
      }
      setVendedorDialog(false);
      loadVendedores();
    } catch (e) {
      alert(e.response?.data?.error || "Error");
    }
  };

  const editVendedor = (v) => {
    setVendedor({ ...v });
    setVendedorDialog(true);
  };

  const leftToolbarTemplate = () => (
    <Button
      label="Nuevo Vendedor"
      icon="pi pi-plus"
      severity="success"
      onClick={() => {
        setVendedor({ nombre: "", email: "", telefono: "", activo: true });
        setVendedorDialog(true);
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
    <Button
      icon="pi pi-pencil"
      rounded
      outlined
      onClick={() => editVendedor(rowData)}
    />
  );

  return (
    <div className="card shadow-2 p-4 border-round-xl bg-gray-900-alpha-10">
      <h2 className="text-white font-light">
        Gestión de <span className="font-bold text-blue-400">Vendedores</span>
      </h2>
      <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

      <DataTable
        value={vendedores}
        loading={loading}
        responsiveLayout="stack"
        breakpoint="960px"
        className="p-datatable-sm"
        stripedRows
      >
        <Column field="nombre" header="Nombre" sortable></Column>
        <Column field="email" header="Email"></Column>
        <Column field="telefono" header="Teléfono"></Column>
        <Column
          field="_count.clientes"
          header="Clientes"
          textAlign="center"
        ></Column>
        <Column header="Estado" body={statusBodyTemplate}></Column>
        <Column body={actionBodyTemplate} exportable={false}></Column>
      </DataTable>

      <Dialog
        visible={vendedorDialog}
        header={vendedor.id ? "Editar Vendedor" : "Nuevo Vendedor"}
        modal
        className="p-fluid"
        style={{ width: "450px" }}
        onHide={() => setVendedorDialog(false)}
        footer={
          <>
            <Button
              label="Cancelar"
              icon="pi pi-times"
              text
              onClick={() => setVendedorDialog(false)}
            />
            <Button label="Guardar" icon="pi pi-check" onClick={saveVendedor} />
          </>
        }
      >
        {/* Campo Nombre */}
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
            required
            autoFocus
          />
        </div>

        {/* Campo Email */}
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
            required
          />
        </div>

        {/* NUEVO: Campo Teléfono */}
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

        {/* NUEVO: Campo Estado (Activo/Inactivo) */}
        <div className="field flex align-items-center gap-3">
          <label htmlFor="activo" className="font-bold">
            ¿Vendedor Activo?
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
