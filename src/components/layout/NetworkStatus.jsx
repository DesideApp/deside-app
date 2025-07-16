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
            const [statusData, tpsData] = await Promise.all([getSolanaStatus(), getSolanaTPS()]);
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
        fetchData(); // 🔹 Llamada inicial

        if (!intervalRef.current) { // ✅ Solo un intervalo activo
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

    const tpsBars = useMemo(() => {
        if (tps <= 0) return [0, 0, 0, 0];
        if (tps > 3000) return [100, 90, 80, 70];
        if (tps > 2000) return [80, 70, 60, 50];
        if (tps > 1000) return [60, 50, 40, 30];
        return [40, 30, 20, 10];
    }, [tps]);

    return (
        <div className={`network-status-container ${className}`}>
            <div className={`network-status-logo-container ${className}`}>
                <img
                src="/companys/solanacolor.svg"
                alt="Solana Logo"
                style={{ width: "18px", height: "18px" }}
                className="chain-logo"
                />
            </div>   
            <div className="status-container">
                <div className={`status-light ${statusColor}`}></div>
            </div>

            <div className="tps-container">
                <div className="tps-bars">
                    {tpsBars.map((height, index) => (
                        <div key={index} className={`tps-bar ${tps > 0 ? "active" : "inactive"}`} style={{ height: `${height}%` }}></div>
                    ))}
                </div>
            </div>

            {error && <span className="error">{error}</span>}
        </div>
    );
});

export default NetworkStatus;
