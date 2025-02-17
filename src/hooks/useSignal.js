import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import DOMPurify from 'dompurify';

const useSignal = (backendUrl, pubkey, isAuthenticated, onContactRequest, onContactAccepted) => {
    const socket = useRef(null);
    const [connected, setConnected] = useState(false);
    const [signals, setSignals] = useState([]);

    useEffect(() => {
        if (!pubkey || !isAuthenticated) {
            console.warn("⚠️ Pubkey y autenticación son requeridos para la señalización.");
            return;
        }

        //if (!socket.current) {
            //socket.current = io(backendUrl, { autoConnect: false });
        //}

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

            // ✅ Registrar la wallet en el WebSocket Server
            socket.current.emit("register_wallet", pubkey);
        });

        socket.current.on("disconnect", () => {
            setConnected(false);
            console.warn("⚠️ Socket de señalización desconectado.");
        });

        socket.current.on("signal", (data) => {
            const sanitizedData = DOMPurify.sanitize(data);
            setSignals((prev) => [...prev, sanitizedData]);
        });

        // ✅ Escuchar eventos de solicitudes de contacto
        socket.current.on("contact_request", ({ from }) => {
            console.log(`📨 Nueva solicitud de contacto recibida de ${from}`);
            if (onContactRequest) onContactRequest(from);
        });

        // ✅ Escuchar eventos de contactos aceptados
        socket.current.on("contact_accepted", ({ from }) => {
            console.log(`✅ Contacto aceptado: ${from}`);
            if (onContactAccepted) onContactAccepted(from);
        });

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [backendUrl, pubkey, isAuthenticated, onContactRequest, onContactAccepted]);

    const sendSignal = (targetPubkey, signalData) => {
        if (!socket.current || !socket.current.connected) {
            console.error("❌ No se puede enviar señal, socket no conectado.");
            return;
        }
        socket.current.emit("signal", { target: targetPubkey, signal: signalData });
    };

    const sendContactRequest = (targetPubkey) => {
        if (!socket.current || !socket.current.connected) {
            console.error("❌ No se puede enviar solicitud, socket no conectado.");
            return;
        }
        console.log(`📨 Enviando solicitud de contacto a ${targetPubkey}...`);
        socket.current.emit("contact_request", { from: pubkey, to: targetPubkey });
    };

    const notifyContactAccepted = (targetPubkey) => {
        if (!socket.current || !socket.current.connected) {
            console.error("❌ No se puede notificar aceptación de contacto, socket no conectado.");
            return;
        }
        console.log(`✅ Notificando a ${targetPubkey} que se aceptó la solicitud.`);
        socket.current.emit("contact_accepted", { from: pubkey, to: targetPubkey });
    };

    return { connected, signals, sendSignal, sendContactRequest, notifyContactAccepted };
};

export default useSignal;
