import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"; // Asegúrate de que la extensión sea .jsx
import "./index.css";
import { PrimeReactProvider, addLocale } from "primereact/api";

// Temas de PrimeReact
// import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/themes/lara-dark-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

// Configuración de idioma español
addLocale("es", {
  accept: "Sí",
  reject: "No",
  choose: "Seleccionar",
  upload: "Subir",
  cancel: "Cancelar",
  dayNames: [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ],
  dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
  dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
  monthNames: [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ],
  monthNamesShort: [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ],
  today: "Hoy",
  clear: "Limpiar",
});

// Eliminamos el "!" después de ('root')
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PrimeReactProvider value={{ locale: "es", ripple: true }}>
      <App />
    </PrimeReactProvider>
  </React.StrictMode>
);
