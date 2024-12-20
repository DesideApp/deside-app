import React, { useEffect, useState } from 'react';
import "./BottomBar.css";
import NetworkStatus from './NetworkStatus';

function BottomBar() {
    const [solPrice, setSolPrice] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchSolPrice = async () => {
            try {
                const response = await fetch('https://backend-deside.onrender.com/api/solana-price');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                if (isMounted) {
                    setSolPrice(data.price);
                }
            } catch (error) {
                console.error('Error al obtener el precio de Solana:', error);
                if (isMounted) {
                    setSolPrice('N/A');
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
        <footer className="bottom-bar">
            <button className="bottom-bar-button">LIVE</button>
            <button className="bottom-bar-button">Lite</button>
            <button className="bottom-bar-button">Pro</button>
            <button className="bottom-bar-button">Ajustes</button>

            <div className="network-info">
                <NetworkStatus className="network-status" />
                <div className="solana-price">
                    <span>Precio SOL: {solPrice ? `$${solPrice}` : 'Cargando...'}</span>
                </div>
            </div>
        </footer>
    );
}

export default BottomBar;
