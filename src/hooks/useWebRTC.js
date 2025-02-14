import { useEffect, useRef, useState } from "react";

const useWebRTC = (selectedContact, walletAddress, isAuthenticated) => {
    const [messages, setMessages] = useState([]);
    const peerRef = useRef(null);
    const dataChannelRef = useRef(null);

    useEffect(() => {
        if (!walletAddress || !selectedContact || !isAuthenticated) {
            console.warn("⚠️ WebRTC no puede iniciarse sin autenticación y contacto seleccionado.");
            return;
        }

        console.log(`🔵 Estableciendo conexión con ${selectedContact} vía WebRTC`);

        const peer = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        peer.ondatachannel = (event) => {
            dataChannelRef.current = event.channel;
            dataChannelRef.current.onmessage = (e) => {
                setMessages((prev) => [...prev, { sender: "peer", text: e.data }]);
            };
        };

        peerRef.current = peer;

        return () => {
            if (peerRef.current) {
                peerRef.current.close();
            }
        };
    }, [selectedContact, walletAddress, isAuthenticated]);

    const sendMessage = (text) => {
        if (dataChannelRef.current) {
            dataChannelRef.current.send(text);
            setMessages((prev) => [...prev, { sender: "me", text }]);
        } else {
            console.error("❌ No se puede enviar el mensaje, el canal de datos no está disponible.");
        }
    };

    return { messages, sendMessage };
};

export default useWebRTC;
