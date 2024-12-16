import React, { useEffect, useState } from 'react';
import './NetworkStatus.css';
import { fetchWithAuth } from '../services/authServices'; // Importamos fetchWithAuth

function NetworkStatus({ className }) {
    const [status, setStatus] = useState('offline');
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await fetchWithAuth('/api/status');
                if (response.status === 401) {
                    setError('Unauthorized');
                    setStatus('offline');
                } else {
                    setStatus(response.status);
                }
            } catch (error) {
                console.error('Failed to fetch network status:', error);
                setError('Failed to fetch network status');
                setStatus('offline');
            }
        };

        checkStatus();
    }, []);

    return (
        <div className={`network-status ${className}`}>
            <span>Status: {status}</span>
            {error && <span className="error">{error}</span>}
        </div>
    );
}

export default NetworkStatus;
