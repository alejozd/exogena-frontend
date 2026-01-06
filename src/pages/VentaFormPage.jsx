import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import api from "../api/axios";

export const VentaFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useRef(null);

  const [clientes, setClientes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [serialesFiltrados, setSerialesFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);

  const emptyVenta = {
    cliente_id: null,
    vendedor_id: null,
    serial_erp_id: null,
    ano_gravable: new Date().getFullYear(),
    ano_venta: new Date().getFullYear(),
    fecha_venta: new Date(),
    valor_total: 0,
    observaciones: "",
  };

  const [venta, setVenta] = useState(emptyVenta);

  // UN SOLO useEffect para cargar todo
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Cargar catálogos básicos
        const [resClientes, resVendedores] = await Promise.all([
          api.get("/clientes"),
          api.get("/vendedores"),
        ]);
        setClientes(resClientes.data);
        setVendedores(resVendedores.data);

        if (id && id !== "nueva" && !isNaN(id)) {
          const resVenta = await api.get(`/ventas/${id}`);
          const v = resVenta.data;

          // 1. Cargamos seriales del cliente antes de setear la venta
          const resSer = await api.get(`/seriales/cliente/${v.cliente_id}`);
          setSerialesFiltrados(resSer.data);

          // 2. Seteamos la venta con los tipos de datos que tus catálogos esperan
          setVenta({
            ...v,
            fecha_venta: new Date(v.fecha_venta),
            // Cliente y Serial como String (vienen de BigInt en el backend)
            cliente_id: v.cliente_id.toString(),
            serial_erp_id: v.serial_erp_id.toString(),
            // Vendedor como Number (es un int estándar)
            vendedor_id: v.vendedor_id ? Number(v.vendedor_id) : null,
            valor_total: parseFloat(v.valor_total || 0),
          });
        } else {
          setVenta(emptyVenta);
        }
      } catch (e) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail:
            "No se pudo conectar con el servidor " + e.response?.data?.error,
        });
      }
    };

    loadInitialData();
  }, [id]);

  // Cargar seriales cuando cambie el cliente
  useEffect(() => {
    // Solo cargar si el cliente_id existe y NO estamos en el proceso inicial de carga de una venta existente
    if (venta.cliente_id) {
      fetchSeriales(venta.cliente_id);
    }
  }, [venta.cliente_id]);

  const fetchSeriales = async (clienteId) => {
    try {
      const res = await api.get(`/seriales/cliente/${clienteId}`);
      setSerialesFiltrados(res.data);
    } catch (e) {
      console.error("Error seriales " + e.response?.data?.error);
    }
  };

  const onSave = async () => {
    if (!venta.cliente_id || !venta.serial_erp_id || venta.valor_total <= 0) {
      toast.current.show({
        severity: "warn",
        detail: "Campos obligatorios incompletos",
      });
      return;
    }

    setLoading(true);
    try {
      if (id && !isNaN(id)) {
        await api.put(`/ventas/${id}`, venta);
      } else {
        await api.post("/ventas", venta);
      }
      toast.current.show({
        severity: "success",
        detail: "Guardado correctamente",
      });
      setTimeout(() => navigate("/ventas"), 1000);
    } catch (e) {
      toast.current.show({
        severity: "error",
        detail: "Error al guardar " + e.response?.data?.error,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-content-center p-4">
      <Toast ref={toast} />
      <Card
        title={id && !isNaN(id) ? "Editar Venta" : "Nueva Venta"}
        className="w-full md:w-8"
      >
        <div className="p-fluid grid">
          <div className="field col-12 md:col-6">
            <label className="font-bold">Cliente</label>
            <Dropdown
              value={venta.cliente_id}
              options={clientes}
              optionLabel="razon_social"
              optionValue="id"
              onChange={(e) =>
                setVenta({ ...venta, cliente_id: e.value, serial_erp_id: null })
              }
              placeholder="Seleccione cliente"
              filter
            />
          </div>
          <div className="field col-12 md:col-6">
            <label className="font-bold">Vendedor</label>
            <Dropdown
              value={venta.vendedor_id}
              options={vendedores}
              optionLabel="nombre"
              optionValue="id"
              onChange={(e) => setVenta({ ...venta, vendedor_id: e.value })}
              placeholder="Seleccione vendedor"
            />
          </div>
          <div className="field col-12">
            <label className="font-bold">Serial</label>
            <Dropdown
              value={venta.serial_erp_id}
              options={serialesFiltrados}
              optionLabel={(opt) =>
                `${opt.nombre_software} - ${opt.serial_erp}`
              }
              optionValue="id"
              onChange={(e) => setVenta({ ...venta, serial_erp_id: e.value })}
              disabled={!venta.cliente_id}
            />
          </div>
          <div className="field col-12 md:col-4">
            <label className="font-bold">Fecha</label>
            <Calendar
              value={venta.fecha_venta}
              onChange={(e) => setVenta({ ...venta, fecha_venta: e.value })}
              showIcon
            />
          </div>
          <div className="field col-12 md:col-4">
            <label className="font-bold">Año Venta</label>
            <InputNumber
              value={venta.ano_venta}
              onValueChange={(e) => setVenta({ ...venta, ano_venta: e.value })}
              useGrouping={false}
            />
          </div>
          <div className="field col-12 md:col-4">
            <label className="font-bold">Año Gravable</label>
            <InputNumber
              value={venta.ano_gravable}
              onValueChange={(e) =>
                setVenta({ ...venta, ano_gravable: e.value })
              }
              useGrouping={false}
            />
          </div>
          <div className="field col-12">
            <label className="font-bold text-green-600">Valor Total</label>
            <InputNumber
              value={venta.valor_total}
              onValueChange={(e) =>
                setVenta({ ...venta, valor_total: e.value })
              }
              mode="currency"
              currency="COP"
              locale="es-CO"
            />
          </div>
          <div className="field col-12">
            <label className="font-bold">Observaciones</label>
            <InputTextarea
              value={venta.observaciones}
              onChange={(e) =>
                setVenta({ ...venta, observaciones: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="col-12 flex justify-content-end gap-2">
            <Button
              label="Cancelar"
              className="p-button-text"
              onClick={() => navigate("/ventas")}
            />
            <Button
              label="Guardar"
              icon="pi pi-check"
              loading={loading}
              onClick={onSave}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
