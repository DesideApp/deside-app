import React from "react";
import ContactRequests from "../chatcomps/ContactRequests"; // ✅ Sección de solicitudes de contacto
import "./RightPanel.css"; 

function RightPanel() {
  return (
    <div className="right-panel">
      <ContactRequests /> {/* 🔹 Muestra solicitudes de contacto */}
    </div>
  );
}

export default RightPanel;
