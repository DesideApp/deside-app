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

    return (
        <div className={`network-status ${className}`}>
            <span>Status: <span className={`status-light ${getStatusColor()}`}></span></span>
            <span>TPS: {tps}</span>
            {error && <span className="error">{error}</span>}
        </div>
    );
}

export default NetworkStatus;
