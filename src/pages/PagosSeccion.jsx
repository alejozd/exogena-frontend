import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Dialog } from "primereact/dialog";
import api from "../api/axios";

export const PagosSeccion = ({ ventaId, onPagoRegistrado }) => {
  const [pagos, setPagos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nuevoPago, setNuevoPago] = useState({
    monto_pagado: 0,
    fecha_pago: new Date(),
    metodo_pago: "transferencia",
  });

  // Definimos la función para obtener pagos
  const fetchPagos = useCallback(async () => {
    // Si no hay ID o es una venta nueva, limpiamos la tabla y salimos
    if (!ventaId || ventaId === "nueva") {
      setPagos([]);
      return;
    }

    try {
      const res = await api.get(`/pagos/venta/${ventaId}`);
      setPagos(res.data);
    } catch (error) {
      console.error("Error al obtener pagos:", error);
    }
  }, [ventaId]);

  // EFECTO: Solo se dispara cuando ventaId cambia
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (ventaId && ventaId !== "nueva") {
        try {
          const res = await api.get(`/pagos/venta/${ventaId}`);
          if (isMounted) {
            setPagos(res.data);
          }
        } catch (error) {
          console.error("Error en useEffect pagos:", error);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false; // Limpieza para evitar fugas de memoria
    };
  }, [ventaId]); // Dependencia mínima

  const registrarPago = async () => {
    if (!nuevoPago.monto_pagado || nuevoPago.monto_pagado <= 0) {
      alert("Por favor ingrese un monto válido");
      return;
    }
    try {
      await api.post("/pagos", { ...nuevoPago, venta_id: ventaId });
      setShowModal(false);

      setNuevoPago({
        monto_pagado: 0,
        fecha_pago: new Date(),
        metodo_pago: "transferencia",
      });

      // Recargamos la tabla y notificamos al padre
      await fetchPagos();
      if (onPagoRegistrado) onPagoRegistrado();
    } catch (error) {
      console.error("Error al registrar pago", error);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex justify-content-between align-items-center mb-2">
        <h3 className="m-0">Historial de Pagos</h3>
        <Button
          label="Registrar Abono"
          icon="pi pi-plus"
          className="p-button-sm p-button-success"
          onClick={() => setShowModal(true)}
        />
      </div>

      <DataTable
        value={pagos}
        className="p-datatable-sm shadow-1"
        emptyMessage="No hay pagos registrados"
        responsiveLayout="scroll"
      >
        <Column
          field="fecha_pago"
          header="Fecha"
          body={(rd) =>
            rd.fecha_pago ? new Date(rd.fecha_pago).toLocaleDateString() : ""
          }
        />
        <Column field="metodo_pago" header="Método" />
        <Column
          field="monto_pagado"
          header="Monto"
          body={(rd) =>
            (rd.monto_pagado || 0).toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
            })
          }
        />
      </DataTable>

      <Dialog
        header="Nuevo Pago"
        visible={showModal}
        onHide={() => setShowModal(false)}
        style={{ width: "350px" }}
      >
        <div className="p-fluid">
          <div className="field">
            <label className="font-bold">Monto del Abono</label>
            <InputNumber
              value={nuevoPago.monto_pagado}
              onValueChange={(e) =>
                setNuevoPago({ ...nuevoPago, monto_pagado: e.value })
              }
              mode="currency"
              currency="COP"
              locale="es-CO"
              autoFocus
            />
          </div>
          <Button
            label="Guardar Pago"
            icon="pi pi-check"
            onClick={registrarPago}
            className="mt-2"
          />
        </div>
      </Dialog>
    </div>
  );
};
