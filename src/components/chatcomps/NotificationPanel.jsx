import React, { memo } from "react";
import ContactRequests from "./ContactRequests";
import "./NotificationPanel.css";

const NotificationPanel = () => {
  return (
    <div className="notification-panel-container">
      <h2 className="notification-title">Notifications</h2>

      {/* ✅ Aquí se renderizan todas las secciones de notificaciones */}
      <section className="notifications-section">
        <ContactRequests />
      </section>

      {/* 🔥 FUTURO:
          <section className="notifications-section">
            <OtherNotifications />
          </section>
      */}
    </div>
  );
};

export default memo(NotificationPanel);
