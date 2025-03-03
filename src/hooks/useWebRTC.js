import { useEffect, useRef, useState } from "react";
import { apiRequest as fetchWithAuth } from "../services/apiService.js"; // ✅ Actualizado

const useWebRTC = (selectedContact, walletAddress) => {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("idle"); // ✅ Estado de conexión
  const peerRef = useRef(null);
  const dataChannelRef = useRef(null);

  // ✅ **Verificar si el contacto está confirmado antes de iniciar WebRTC**
  const validateContactStatus = async () => {
    try {
      const response = await fetchWithAuth(`/api/contacts/status/${selectedContact}`);
      const data = await response.json();
      return data.isConfirmed && !data.isBlocked;
    } catch (error) {
      console.error("❌ Error al verificar el estado del contacto:", error);
      return false;
    }
  };

  // ✅ **Inicializa WebRTC solo si el contacto está confirmado**
  const initializeWebRTC = async () => {
    if (!(await validateContactStatus())) {
      console.warn("⚠️ WebRTC no puede iniciarse sin contacto confirmado.");
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
        attemptReconnection();
      }
    };

    peerRef.current = peer;
  };

  // 🔄 **Intentar reconexión automática solo si el contacto sigue confirmado**
  const attemptReconnection = async () => {
    console.log("🔄 Intentando reconexión...");
    if (await validateContactStatus()) {
      await initializeWebRTC();
    } else {
      console.warn("❌ No se puede reconectar. El contacto ya no está confirmado.");
    }
  };

  // 💬 **Enviar mensaje solo si el contacto sigue confirmado**
  const sendMessage = async (text) => {
    if (!(await validateContactStatus())) {
      console.error("❌ No se puede enviar el mensaje. El contacto ya no está confirmado.");
      return;
    }

    if (!dataChannelRef.current) {
      console.error("❌ No se puede enviar mensaje, canal de datos no inicializado.");
      return;
    }

    dataChannelRef.current.send(text);
    setMessages((prev) => [...prev, { sender: "me", text }]);
  };

  // ✅ **Gestión del ciclo de vida del WebRTC**
  useEffect(() => {
    if (selectedContact) {
      initializeWebRTC();
    }

    return () => {
      if (peerRef.current) {
        peerRef.current.close();
        console.log("🔴 Conexión WebRTC cerrada.");
      }
    };
  }, [selectedContact]);

  return { messages, connectionStatus, sendMessage };
};

export default useWebRTC;
