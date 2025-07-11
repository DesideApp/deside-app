import React, { useEffect, useState } from "react";
import { notificationEmitter } from "../../services/notificationService.js";

export default function NotificationContainer() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handler = ({ message, type = "info", duration = 3000, progress = false }) => {
      const id = Date.now();

      setNotifications((prev) => {
        // Agrupar mensajes idénticos
        const existing = prev.find(
          (n) => n.message === message && n.type === type
        );
        if (existing) {
          return prev.map((n) =>
            n.id === existing.id
              ? { ...n, count: (n.count || 1) + 1 }
              : n
          );
        }
        return [...prev, { id, type, message, duration, progress }];
      });

      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== id)
        );
      }, duration);
    };

    notificationEmitter.on("notify", handler);
    return () => {
      notificationEmitter.off("notify", handler);
    };
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return "✔️";
      case "error":
        return "❌";
      case "info":
      default:
        return "ℹ️";
    }
  };

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`
            flex items-center px-4 py-2 rounded shadow-lg
            transition-all duration-300
            ${notif.type === "success" ? "bg-green-600 text-white" : ""}
            ${notif.type === "error" ? "bg-red-600 text-white" : ""}
            ${notif.type === "info" ? "bg-blue-600 text-white" : ""}
          `}
        >
          <span className="mr-2">{getIcon(notif.type)}</span>
          <span>{notif.message}</span>
          {notif.count > 1 && (
            <span className="ml-2 text-xs bg-black bg-opacity-20 px-1 rounded">
              x{notif.count}
            </span>
          )}
          {notif.progress && (
            <div className="w-full h-1 mt-2 bg-white bg-opacity-30 rounded overflow-hidden">
              <div
                className="h-full bg-white"
                style={{
                  width: "100%",
                  animation: `shrink ${notif.duration}ms linear forwards`,
                }}
              ></div>
            </div>
          )}
        </div>
      ))}

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
