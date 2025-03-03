import React, { useEffect, useState } from "react";
import "./NetworkStatus.css";
import { getSolanaStatus, getSolanaTPS } from "../../services/apiService.js"; // ✅ API centralizada

function NetworkStatus({ className }) {
  const [status, setStatus] = useState("offline");
  const [tps, setTps] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let interval;

    const fetchData = async () => {
      try {
        const [statusData, tpsData] = await Promise.all([getSolanaStatus(), getSolanaTPS()]);

        if (isMounted) {
          setStatus(statusData.status);
          setTps(tpsData.tps);
          setError(null);
        }
      } catch (error) {
        console.error("❌ Error obteniendo estado de la red:", error);
        if (isMounted) {
          setError("🔴 Error obteniendo datos de la red.");
          setStatus("offline");
          setTps(null);
        }
      }
    };

    fetchData();
    interval = setInterval(fetchData, 10000);

    return () => {
      clearInterval(interval);
      isMounted = false;
    };
  }, []);

  const getStatusColor = () => {
    if (status === "connected") return "green";
    if (status === "congested") return "yellow";
    return "red";
  };

  const getTpsBars = () => {
    if (tps === null) return [0, 0, 0, 0]; // Estado desconocido

    if (tps > 3000) return [100, 90, 80, 70]; // Alto rendimiento
    if (tps > 2000) return [80, 70, 60, 50]; // Carga media-alta
    if (tps > 1000) return [60, 50, 40, 30]; // Congestión moderada
    return [40, 30, 20, 10]; // Red congestionada
  };

  return (
    <div className={`network-status-container ${className}`}>
      <div className="status-container">
        <span className="network-status-label">Status:</span>
        <div className={`status-bar ${getStatusColor()}`}></div>
      </div>

      <div className="tps-container">
        <span className="network-status-label">TPS:</span>
        <div className="tps-bars">
          {getTpsBars().map((height, index) => (
            <div key={index} className="tps-bar" style={{ height: `${height}%` }}></div>
          ))}
        </div>
      </div>

      {error && <span className="error">{error}</span>}
    </div>
  );
}

export default NetworkStatus;
