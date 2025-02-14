import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import DOMPurify from 'dompurify';

const useSignal = (backendUrl, pubkey, isAuthenticated) => {
    const socket = useRef(null);
    const [connected, setConnected] = useState(false);
    const [signals, setSignals] = useState([]);

    useEffect(() => {
        if (!pubkey || !isAuthenticated) {
            console.warn("⚠️ Pubkey y autenticación son requeridos para la señalización.");
            return;
        }

        if (!socket.current) {
            socket.current = io(backendUrl, {
                query: { pubkey },
                autoConnect: false,
            });
        }

        const connectSocket = () => {
            if (!socket.current.connected) {
                console.log("🔵 Conectando socket de señalización...");
                socket.current.connect();
            }
        };

        if (isAuthenticated) {
            connectSocket();
        }

        socket.current.on("connect", () => {
            setConnected(true);
            console.log("✅ Socket de señalización conectado.");
        });

        socket.current.on("disconnect", () => {
            setConnected(false);
            console.warn("⚠️ Socket de señalización desconectado.");
        });

        socket.current.on("signal", (data) => {
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
        if (!socket.current || !socket.current.connected) {
            console.error("❌ No se puede enviar señal, socket no conectado.");
            return;
        }
        socket.current.emit("signal", { target: targetPubkey, signal: signalData });
    };

    return { connected, signals, sendSignal };
};

export default useSignal;
