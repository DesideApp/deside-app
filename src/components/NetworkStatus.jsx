import React, { useEffect, useState } from 'react';
import './NetworkStatus.css';
import API_BASE_URL from '../config/apiConfig';



function NetworkStatus({ className }) {
    const [networkStatus, setNetworkStatus] = useState('');
    const [tps, setTps] = useState(0);

    useEffect(() => {
        // Función para verificar el estado de la red desde el backend
        const checkNetworkStatus = async () => {
            try {
                console.log("Fetching network status...");
                const response = await fetch(`${API_BASE_URL}/solana-status`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Network Status Response:', data); // Log para ver la respuesta
                setNetworkStatus(data.status);
            } catch (error) {
                console.error('Error al obtener el estado de la red:', error);
                setNetworkStatus('disconnected');
            }
        };

        // Función para obtener el TPS desde el backend
        const checkTPS = async () => {
            try {
                console.log("Fetching TPS...");
                const response = await fetch(`${API_BASE_URL}/solana-tps`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                console.log('TPS Response:', data); // Log para ver la respuesta
                setTps(parseFloat(data.tps));
            } catch (error) {
                console.error('Error al obtener el TPS:', error);
                setTps(0);
            }
        };

        // Llamadas iniciales a las funciones
        checkNetworkStatus();
        checkTPS();

        // Intervalo para actualizar cada 10 segundos
        const interval = setInterval(() => {
            checkNetworkStatus();
            checkTPS();
        }, 10000);

        // Limpiar el intervalo al desmontar el componente
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`network-status-container ${className}`}>
            {/* Etiqueta de estado */}
            <div className="network-status-label">
                {networkStatus === 'connected' ? 'Red: Conectada' : 'Red: Desconectada'}
            </div>

            {/* Indicador de barras móviles */}
            <div className="tps-bars">
                {[...Array(5)].map((_, index) => (
                    <div
                        key={index}
                        className={`tps-bar ${networkStatus === 'connected' ? 'active' : ''}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    ></div>
                ))}
            </div>
        </div>
    );
}

export default NetworkStatus;
