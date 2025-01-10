import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import DOMPurify from 'dompurify';

const useSignal = (backendUrl, pubkey, isAuthenticated) => {
    const socket = useRef(null);
    const [connected, setConnected] = useState(false);
    const [signals, setSignals] = useState([]);

    useEffect(() => {
        if (!pubkey || !isAuthenticated) {
            console.error('Pubkey and authentication are required to initialize signaling.');
            return;
        }

        // Inicializar el socket con autoConnect: false
        socket.current = io(backendUrl, {
            query: { pubkey },
            autoConnect: false, // No conectar automáticamente
        });

        // Conectar el socket solo cuando sea necesario
        const connectSocket = () => {
            if (!socket.current.connected) {
                socket.current.connect();
            }
        };

        // Conectar el socket solo si el usuario está autenticado
        if (isAuthenticated) {
            connectSocket();
        }

        socket.current.on('connect', () => {
            setConnected(true);
        });

        socket.current.on('disconnect', () => {
            setConnected(false);
        });

        socket.current.on('signal', (data) => {
            const sanitizedData = DOMPurify.sanitize(data);
            setSignals((prev) => [...prev, sanitizedData]);
        });

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [backendUrl, pubkey, isAuthenticated]);

    const sendSignal = (targetPubkey, signalData) => {
        if (socket.current) {
            socket.current.emit('signal', { target: targetPubkey, signal: signalData });
        } else {
            console.error('Socket no está conectado.');
        }
    };

    return { connected, signals, sendSignal };
};

export default useSignal;
