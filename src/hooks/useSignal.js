import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import DOMPurify from 'dompurify';
import { ensureWalletState } from "../services/walletStateService"; // 🔥 CENTRALIZAMOS AUTENTICACIÓN

const useSignal = (backendUrl, onContactRequest, onContactAccepted) => {
    const socket = useRef(null);
    const [connected, setConnected] = useState(false);
    const [signals, setSignals] = useState([]);
    const [walletStatus, setWalletStatus] = useState({ walletAddress: null, isAuthenticated: false });

    // ✅ **Revisar estado de la wallet antes de conectar**
    const initializeSocket = async () => {
        const status = await ensureWalletState(); // 🔥 **Centralizamos autenticación**
        setWalletStatus(status);

        if (!status.walletAddress || !status.isAuthenticated) {
            console.warn("⚠️ Wallet no conectada o autenticada. No se inicia la señalización.");
            return;
        }

        if (!socket.current) {
            socket.current = io(backendUrl, { autoConnect: false });
        }

        if (!socket.current.connected) {
            console.log("🔵 Conectando socket de señalización...");
            socket.current.connect();
        }

        socket.current.on("connect", () => {
            setConnected(true);
            console.log("✅ Socket de señalización conectado.");
            socket.current.emit("register_wallet", status.walletAddress);
        });

        socket.current.on("disconnect", () => {
            setConnected(false);
            console.warn("⚠️ Socket de señalización desconectado.");
        });

        socket.current.on("signal", (data) => {
            const sanitizedData = DOMPurify.sanitize(data);
            setSignals((prev) => [...prev, sanitizedData]);
        });

        // ✅ **Eventos de contactos**
        socket.current.on("contact_request", ({ from }) => {
            console.log(`📨 Nueva solicitud de contacto recibida de ${from}`);
            if (onContactRequest) onContactRequest(from);
        });

        socket.current.on("contact_accepted", ({ from }) => {
            console.log(`✅ Contacto aceptado: ${from}`);
            if (onContactAccepted) onContactAccepted(from);
        });
    };

    useEffect(() => {
        initializeSocket();

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, []);

    // ✅ **Funciones para interactuar con el servidor WebSocket**
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
        socket.current.emit("contact_request", { from: walletStatus.walletAddress, to: targetPubkey });
    };

    const notifyContactAccepted = (targetPubkey) => {
        if (!socket.current || !socket.current.connected) {
            console.error("❌ No se puede notificar aceptación de contacto, socket no conectado.");
            return;
        }
        console.log(`✅ Notificando a ${targetPubkey} que se aceptó la solicitud.`);
        socket.current.emit("contact_accepted", { from: walletStatus.walletAddress, to: targetPubkey });
    };

    return { connected, signals, sendSignal, sendContactRequest, notifyContactAccepted };
};

export default useSignal;
