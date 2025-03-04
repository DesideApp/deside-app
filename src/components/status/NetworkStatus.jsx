import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import "./NetworkStatus.css";
import { getSolanaStatus, getSolanaTPS } from "../utils/solanaService.js"; // ✅ Nuevo import correcto

const NetworkStatus = React.memo(({ className = "" }) => {
    const [status, setStatus] = useState("offline");
    const [tps, setTps] = useState(null);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);

    const fetchData = useCallback(async () => {
        try {
            const [statusData, tpsData] = await Promise.all([getSolanaStatus(), getSolanaTPS()]);
            setStatus(statusData?.status || "offline");
            setTps(typeof tpsData?.tps === "number" ? tpsData.tps : null);
            setError(null);
        } catch (error) {
            console.error("❌ Error obteniendo estado de la red:", error);
            setError("🔴 Error obteniendo datos de la red.");
            setStatus("offline");
            setTps(null);
        }
    }, []);

    useEffect(() => {
        fetchData();
        intervalRef.current = setInterval(fetchData, 10000);

        return () => {
            clearInterval(intervalRef.current);
        };
    }, [fetchData]);

    const statusColor = useMemo(() => {
        return status === "connected" ? "green" : status === "congested" ? "yellow" : "red";
    }, [status]);

    const tpsBars = useMemo(() => {
        if (tps === null) return [0, 0, 0, 0];

        if (tps > 3000) return [100, 90, 80, 70];
        if (tps > 2000) return [80, 70, 60, 50];
        if (tps > 1000) return [60, 50, 40, 30];
        return [40, 30, 20, 10];
    }, [tps]);

    return (
        <div className={`network-status-container ${className}`}>
            <div className="status-container">
                <span className="network-status-label" aria-live="polite">Status:</span>
                <div className={`status-bar ${statusColor}`}></div>
            </div>

            <div className="tps-container">
                <span className="network-status-label">TPS:</span>
                <div className="tps-bars">
                    {tpsBars.map((height, index) => (
                        <div key={index} className="tps-bar" style={{ height: `${height}%` }}></div>
                    ))}
                </div>
            </div>

            {error && <span className="error">{error}</span>}
        </div>
    );
});

export default NetworkStatus;
