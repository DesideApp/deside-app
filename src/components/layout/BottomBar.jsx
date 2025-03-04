import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import "./BottomBar.css";
import NetworkStatus from "../status/NetworkStatus.jsx";
import { getSolanaPrice } from "../../utils/solanaHelpers.js";

const BottomBar = React.memo(() => {
    const [solPrice, setSolPrice] = useState(null);
    const [hasError, setHasError] = useState(false);
    const intervalRef = useRef(null);

    const fetchSolPrice = useCallback(async () => {
        try {
            const data = await getSolanaPrice();
            setSolPrice(data?.price || null);
            setHasError(false);
        } catch (error) {
            console.error("❌ Error obteniendo el precio de Solana:", error);
            setHasError(true);
            setSolPrice(null);
        }
    }, []);

    useEffect(() => {
        fetchSolPrice();
        intervalRef.current = setInterval(fetchSolPrice, 10000);

        return () => {
            clearInterval(intervalRef.current);
        };
    }, [fetchSolPrice]);

    const displayedPrice = useMemo(() => {
        return hasError ? "🔴 Error" : solPrice ? `SOL: $${solPrice}` : "Cargando...";
    }, [solPrice, hasError]);

    return (
        <footer className="bottom-bar">
            <button className="bottom-bar-button" aria-label="Modo en vivo">LIVE</button>
            <button className="bottom-bar-button" aria-label="Modo Lite">Lite</button>
            <button className="bottom-bar-button" aria-label="Modo Pro">Pro</button>
            <button className="bottom-bar-button" aria-label="Ajustes">Ajustes</button>

            <div className="network-info">
                <NetworkStatus className="network-status" />
                <div className="solana-price" aria-live="polite">
                    <span>{displayedPrice}</span>
                </div>
            </div>
        </footer>
    );
});

export default BottomBar;
