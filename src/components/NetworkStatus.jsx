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

    const renderTpsBars = () => {
        const bars = [];
        const tpsValue = tps || 0;
        const numBars = Math.min(Math.floor(tpsValue / 10), 10); // Adjust the divisor as needed

        for (let i = 0; i < numBars; i++) {
            bars.push(<div key={i} className="tps-bar active"></div>);
        }

        return bars;
    };

    return (
        <div className={`network-status ${className}`}>
            <div className="status-container">
                <span>Status: <span className={`status-light ${getStatusColor()}`}></span></span>
            </div>
            <div className="tps-container">
                <div className="tps-bars">
                    {renderTpsBars()}
                </div>
            </div>
            {error && <span className="error">{error}</span>}
        </div>
    );
}

export default NetworkStatus;
