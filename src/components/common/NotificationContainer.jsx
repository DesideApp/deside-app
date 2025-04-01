import React, { useEffect, useState } from "react";
import { notificationEmitter } from "../../services/notificationService";
import "./NotificationContainer.css"; // Puedes crear estilos opcionales

const NotificationContainer = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const show = (message, type = "info") => {
      const id = Date.now();
      setNotifications((prev) => [...prev, { id, message, type }]);

      // Auto-eliminar después de 3.5 segundos
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 3500);
    };

    notificationEmitter.on("notify", show);
    return () => notificationEmitter.off("notify", show);
  }, []);

  return (
    <div className="notification-wrapper">
      {notifications.map(({ id, message, type }) => (
        <div key={id} className={`notification ${type}`}>
          {message}
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
