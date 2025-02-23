import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// ❌ Quitamos React.StrictMode temporalmente para evitar doble montaje en desarrollo
ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
