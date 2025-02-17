import { useEffect, useRef, useState } from "react";
import { ensureWalletState } from "../services/walletService"; // 🔥 Centralizamos autenticación

const useWebRTC = (selectedContact) => {
    const [messages, setMessages] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState("idle"); // ✅ Estado de conexión
    const peerRef = useRef(null);
    const dataChannelRef = useRef(null);
    const [walletStatus, setWalletStatus] = useState({ walletAddress: null, isAuthenticated: false });

    // ✅ Inicializa WebRTC solo si la wallet está autenticada y hay un contacto seleccionado
    const initializeWebRTC = async () => {
        const status = await ensureWalletState(); // 🔥 **Asegurar autenticación**
        setWalletStatus(status);

        if (!status.walletAddress || !status.isAuthenticated || !selectedContact) {
            console.warn("⚠️ WebRTC no puede iniciarse sin autenticación y contacto seleccionado.");
            return;
        }

        console.log(`🔵 Estableciendo conexión WebRTC con ${selectedContact}`);

        const peer = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        peer.ondatachannel = (event) => {
            dataChannelRef.current = event.channel;
            dataChannelRef.current.onmessage = (e) => {
                setMessages((prev) => [...prev, { sender: "peer", text: e.data }]);
            };
            setConnectionStatus("connected");
        };

        peer.oniceconnectionstatechange = () => {
            if (peer.iceConnectionState === "disconnected") {
                console.warn("⚠️ WebRTC desconectado.");
                setConnectionStatus("disconnected");
            }
        };

        peerRef.current = peer;
    };

    useEffect(() => {
        initializeWebRTC();

        return () => {
            if (peerRef.current) {
                peerRef.current.close();
                console.log("🔴 Conexión WebRTC cerrada.");
            }
        };
    }, [selectedContact]);

    const sendMessage = (text) => {
        if (!dataChannelRef.current) {
            console.error("❌ No se puede enviar mensaje, canal de datos no inicializado.");
            return;
        }
        dataChannelRef.current.send(text);
        setMessages((prev) => [...prev, { sender: "me", text }]);
    };

    return { messages, connectionStatus, sendMessage };
};

export default useWebRTC;
