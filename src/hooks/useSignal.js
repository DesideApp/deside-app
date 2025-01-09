import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import DOMPurify from 'dompurify';

const useSignal = (backendUrl, pubkey) => {
    const socket = useRef(null);
    const [connected, setConnected] = useState(false);
    const [signals, setSignals] = useState([]);

    useEffect(() => {
        if (!pubkey) {
            console.error('Pubkey is required to initialize signaling.');
            return;
        }

        socket.current = io(backendUrl, {
            query: { pubkey },
        });

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
    }, [backendUrl, pubkey]);

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
