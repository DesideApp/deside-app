import React, { useEffect, useState } from "react";
import { notificationEmitter } from "../../services/notificationService.js";

export default function NotificationContainer() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handler = (message, type) => {
      const id = Date.now();
      setNotifications((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== id)
        );
      }, 3000);
    };

    notificationEmitter.on("notify", handler);
    return () => {
      notificationEmitter.off("notify", handler);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`
            px-4 py-2 rounded shadow
            ${notif.type === "success" ? "bg-green-500 text-white" : ""}
            ${notif.type === "error" ? "bg-red-500 text-white" : ""}
            ${notif.type === "info" ? "bg-blue-500 text-white" : ""}
          `}
        >
          {notif.message}
        </div>
      ))}
    </div>
  );
}
