import React, { useEffect, useState } from 'react';
import "./BottomBar.css";
import NetworkStatus from '../status/NetworkStatus.jsx';

function BottomBar() {
    const [solPrice, setSolPrice] = useState(null);
    const [isVisible, setIsVisible] = useState(true);  // Para controlar la visibilidad

    useEffect(() => {
        let isMounted = true;

        // Función para obtener el precio de Solana desde el backend
        const fetchSolPrice = async () => {
            try {
                const response = await fetch('https://backend-deside.onrender.com/api/solana-price');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                if (isMounted) {
                    setSolPrice(data.price); // Ajusta esto según la estructura de la respuesta de tu backend
                }
            } catch (error) {
                console.error('Error al obtener el precio de Solana:', error);
                if (isMounted) {
                    setSolPrice('N/A'); // Si hay un error, mostrar 'N/A'
                }
            }
        };

        // Llamada inicial para obtener el precio de Solana
        fetchSolPrice();

        // Intervalo para actualizar el precio cada 10 segundos
        const interval = setInterval(fetchSolPrice, 10000);

        // Limpiar el intervalo al desmontar el componente
        return () => {
            clearInterval(interval);
            isMounted = false;
        };
    }, []);

    // Agregar lógica para ocultar el BottomBar (por ejemplo, si el header desaparece)
    const handleMouseEnter = () => {
        setIsVisible(true);  // Vuelve a mostrar el BottomBar cuando el ratón entra
    };

    const handleMouseLeave = () => {
        setIsVisible(false);  // Oculta el BottomBar cuando el ratón sale
    };

    return (
        <footer
            className={`bottom-bar ${isVisible ? 'visible' : 'hidden'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Botones de funciones */}
            <button className="bottom-bar-button">LIVE</button>
            <button className="bottom-bar-button">Lite</button>
            <button className="bottom-bar-button">Pro</button>
            <button className="bottom-bar-button">Ajustes</button>

            {/* Estado de la red y precio de Solana */}
            <div className="network-info">
                <NetworkStatus className="network-status" />
                <div className="solana-price">
                    <span>SOL: {solPrice ? `$${solPrice}` : 'Cargando...'}</span>
                </div>
            </div>
        </footer>
    );
}

export default BottomBar;
