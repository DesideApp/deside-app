import React, { useEffect, useState } from 'react';
import "./BottomBar.css";
import NetworkStatus from '../status/NetworkStatus.jsx';
import { getSolanaPrice } from "../../services/apiService.js"; // ✅ Usamos la API centralizada

function BottomBar() {
    const [solPrice, setSolPrice] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const [hasError, setHasError] = useState(false); // ✅ Nuevo estado para manejar errores

    useEffect(() => {
        let isMounted = true;

        const fetchSolPrice = async () => {
            try {
                const data = await getSolanaPrice(); // ✅ Ahora usamos `apiService.js`
                if (isMounted) {
                    setSolPrice(data.price);
                    setHasError(false);
                }
            } catch (error) {
                console.error('Error al obtener el precio de Solana:', error);
                if (isMounted) {
                    setHasError(true);
                    setSolPrice(null);
                }
            }
        };

        fetchSolPrice();
        const interval = setInterval(fetchSolPrice, 10000);

        return () => {
            clearInterval(interval);
            isMounted = false;
        };
    }, []);

    return (
        <footer className={`bottom-bar ${isVisible ? 'visible' : ''}`}>
            <button className="bottom-bar-button">LIVE</button>
            <button className="bottom-bar-button">Lite</button>
            <button className="bottom-bar-button">Pro</button>
            <button className="bottom-bar-button">Ajustes</button>

            <div className="network-info">
                <NetworkStatus className="network-status" />
                <div className="solana-price">
                    <span>{hasError ? "🔴 Error" : solPrice ? `SOL: $${solPrice}` : 'Cargando...'}</span>
                </div>
            </div>
        </footer>
    );
}

export default BottomBar;
