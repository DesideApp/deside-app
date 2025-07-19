import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import "./NetworkStatus.css";
import { getSolanaStatus, getSolanaTPS } from "../../utils/solanaHelpers.js";

const NetworkStatus = React.memo(({ className = "" }) => {
  const [status, setStatus] = useState("offline");
  const [tps, setTps] = useState(0);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const isMountedRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return;
    try {
      const [statusData, tpsData] = await Promise.all([
        getSolanaStatus(),
        getSolanaTPS(),
      ]);
      if (isMountedRef.current) {
        setStatus(statusData || "offline");
        setTps(typeof tpsData === "number" ? tpsData : 0);
        setError(null);
      }
    } catch (error) {
      console.error("❌ Error obteniendo estado de la red:", error);
      if (isMountedRef.current) {
        setError("🔴 Error obteniendo datos.");
        setStatus("offline");
        setTps(0);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    if (!intervalRef.current) {
      intervalRef.current = setInterval(fetchData, 30000);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchData]);

  const statusColor = useMemo(() => {
    return status === "connected" ? "green" : status === "congested" ? "yellow" : "red";
  }, [status]);

  const progressWidth = Math.min((tps / 4000) * 100, 100);

  const formattedTps = useMemo(() => {
    if (tps >= 1000) return `${(tps / 1000).toFixed(1)}k`;
    return `${tps.toFixed(0)}`;
  }, [tps]);

  const progressColor = useMemo(() => {
    if (tps >= 3000) return "#4caf50";   // verde
    if (tps >= 1500) return "#ff9800";   // amarillo
    return "#f44336";                    // rojo
  }, [tps]);

  return (
    <div className={`network-status-bar-container ${className}`}>
      <img
        src="/companys/solanacolor.svg"
        alt="Solana Logo"
        className="solana-icon"
      />

      <div
        className="tps-progress-wrapper"
        style={{ visibility: tps > 0 ? "visible" : "hidden" }}
      >
        <div
          className="tps-progress-fill"
          style={{
            width: `${progressWidth}%`,
            backgroundColor: progressColor,
          }}
        ></div>
      </div>

      <span className="tps-number">{formattedTps} TPS</span>

      <div className={`status-light ${statusColor}`} />

      {error && <span className="error">{error}</span>}
    </div>
  );
});

export default NetworkStatus;
