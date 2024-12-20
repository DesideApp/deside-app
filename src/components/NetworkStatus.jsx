import React, { useEffect, useState } from 'react';
import './NetworkStatus.css';

function NetworkStatus({ className }) {
    const [status, setStatus] = useState('offline');
    const [tps, setTps] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNetworkStatus = async () => {
            try {
                const response = await fetch('https://backend-deside.onrender.com/api/solana-status');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setStatus(data.status);
            } catch (error) {
                console.error('Failed to fetch network status:', error);
                setError('Failed to fetch network status');
                setStatus('offline');
            }
        };

        const fetchTps = async () => {
            try {
                const response = await fetch('https://backend-deside.onrender.com/api/solana-tps');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setTps(data.tps);
            } catch (error) {
                console.error('Failed to fetch TPS:', error);
                setError('Failed to fetch TPS');
                setTps('N/A');
            }
        };

        fetchNetworkStatus();
        fetchTps();

        const interval = setInterval(() => {
            fetchNetworkStatus();
            fetchTps();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = () => {
        if (status === 'connected') return 'green';
        if (status === 'congested') return 'yellow';
        return 'red';
    };

    const getBarHeights = () => {
        if (tps === null || tps === 'N/A') return [8, 8, 8, 8];
        const baseHeight = 8;
        const maxHeight = 16;
        const tpsFactor = tps / 1000; // Ajusta este valor según el rango de TPS esperado
        return [1, 2, 3, 4].map(factor => baseHeight + (maxHeight - baseHeight) * tpsFactor * factor / 4);
    };

    const barHeights = getBarHeights();

    return (
        <div className={`network-status-container ${className}`}>
            <div className="status-container">
                <span className="network-status-label">Status:</span>
                <div className={`status-light ${getStatusColor()}`}></div>
            </div>
            <div className="tps-container">
                <span className="network-status-label">TPS:</span>
                <div className="tps-bars">
                    {barHeights.map((height, index) => (
                        <div
                            key={index}
                            className="tps-bar"
                            style={{ height: `${height}px` }}
                        ></div>
                    ))}
                </div>
            </div>
            {error && <span className="error">{error}</span>}
        </div>
    );
}

export default NetworkStatus;
