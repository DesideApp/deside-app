import React, { useEffect, useState } from 'react';
import './NetworkStatus.css';
import { fetchWithAuth } from '../services/authServices'; // Importamos fetchWithAuth

function NetworkStatus({ className }) {
    const [status, setStatus] = useState('offline');

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await fetchWithAuth('/api/status');
                setStatus(response.status);
            } catch (error) {
                console.error('Failed to fetch network status:', error);
                setStatus('offline');
            }
        };

        checkStatus();
    }, []);

    return (
        <div className={`network-status ${className}`}>
            <span>Status: {status}</span>
        </div>
    );
}

export default NetworkStatus;
