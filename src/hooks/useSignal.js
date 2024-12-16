import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import DOMPurify from 'dompurify'; // Importar DOMPurify para sanitización

const useSignal = (backendUrl, pubkey) => {
    const socket = useRef(null);
    const [connected, setConnected] = useState(false);
    const [signals, setSignals] = useState([]); // Lista de señales recibidas

    useEffect(() => {
        if (!pubkey) {
            console.error('Pubkey is required to initialize signaling.');
            return;
        }

        // Conexión al WebSocket
        socket.current = io(backendUrl, {
            query: { pubkey },
        });

        // Manejo de conexión/desconexión
        socket.current.on('connect', () => {
            console.log('Conectado al WebSocket.');
            setConnected(true);
        });

        socket.current.on('disconnect', () => {
            console.log('Desconectado del WebSocket.');
            setConnected(false);
        });

        // Manejo de señales entrantes
        socket.current.on('signal', (data) => {
            console.log('Señal recibida:', data);
            const sanitizedData = DOMPurify.sanitize(data); // Sanitizar datos recibidos
            setSignals((prev) => [...prev, sanitizedData]);
        });

        // Limpieza al desmontar
        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [backendUrl, pubkey]);

    // Función para enviar señales
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
