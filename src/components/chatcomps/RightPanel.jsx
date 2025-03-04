import React, { memo } from "react";
import ContactRequests from "../chatcomps/ContactRequests";
import "./RightPanel.css";

const RightPanel = () => (
  <aside className="right-panel" aria-label="Solicitudes de contacto">
    <ContactRequests />
  </aside>
);

export default memo(RightPanel);
