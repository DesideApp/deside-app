import React, { memo } from "react";
import ContactRequests from "../chatcomps/ContactRequests"; 
import "./RightPanel.css"; 

const RightPanel = memo(() => {
  return (
    <aside className="right-panel" aria-label="Panel lateral de solicitudes de contacto">
      <ContactRequests /> 
    </aside>
  );
});

export default RightPanel;
