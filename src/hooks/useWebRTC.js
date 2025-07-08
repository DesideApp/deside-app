import { useEffect, useRef, useState, useCallback } from "react";
import { apiRequest as fetchWithAuth } from "../services/apiService.js";

const useWebRTC = (selectedContact, walletAddress) => {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("idle");
  const peerRef = useRef(null);
  const dataChannelRef = useRef(null);
  const isReconnecting = useRef(false);

  const validateContactStatus = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`/api/contacts/status/${selectedContact}`);
      if (!response?.isConfirmed) {
        console.warn("⚠️ Contacto no confirmado o bloqueado.");
        return false;
      }
      return true;
    } catch (error) {
      console.error("❌ Error al verificar el estado del contacto:", error);
      return false;
    }
  }, [selectedContact]);

  const initializeWebRTC = useCallback(async () => {
    if (peerRef.current) {
      console.log("🔵 WebRTC ya inicializado. Evitando duplicación.");
      return;
    }

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
        try {
          const parsed = JSON.parse(e.data);
          setMessages((prev) => [
            ...prev,
            {
              sender: "peer",
              ...parsed,
            },
          ]);
        } catch (error) {
          console.error("❌ Error al parsear mensaje WebRTC:", error);
          // fallback: tratarlo como texto plano
          setMessages((prev) => [
            ...prev,
            { sender: "peer", text: e.data },
          ]);
        }
      };
      setConnectionStatus("connected");
    };

    peer.oniceconnectionstatechange = () => {
      if (peer.iceConnectionState === "disconnected" && !isReconnecting.current) {
        console.warn("⚠️ WebRTC desconectado. Intentando reconectar...");
        isReconnecting.current = true;
        attemptReconnection();
      }
    };

    peerRef.current = peer;
  }, [validateContactStatus, selectedContact]);

  const attemptReconnection = useCallback(async () => {
    console.log("🔄 Intentando reconexión...");
    if (await validateContactStatus()) {
      await initializeWebRTC();
      isReconnecting.current = false;
    } else {
      console.warn("❌ No se puede reconectar. El contacto ya no está confirmado.");
    }
  }, [validateContactStatus, initializeWebRTC]);

  // ✅ AHORA acepta un objeto completo
  const sendMessage = useCallback(
    async (messageObject) => {
      if (!(await validateContactStatus())) {
        console.error("❌ No se puede enviar el mensaje. El contacto ya no está confirmado.");
        return;
      }

      if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") {
        console.error("❌ No se puede enviar mensaje, canal de datos no inicializado o cerrado.");
        return;
      }

      try {
        dataChannelRef.current.send(JSON.stringify(messageObject));

        setMessages((prev) => [
          ...prev,
          {
            sender: "me",
            ...messageObject,
          },
        ]);
      } catch (error) {
        console.error("❌ Error al enviar mensaje WebRTC:", error);
      }
    },
    [validateContactStatus]
  );

  useEffect(() => {
    if (selectedContact) {
      initializeWebRTC();
    }

    return () => {
      if (peerRef.current) {
        console.log("🔴 Cerrando conexión WebRTC...");
        peerRef.current.close();
        peerRef.current = null;
      }
    };
  }, [selectedContact, initializeWebRTC]);

  return { messages, connectionStatus, sendMessage };
};

export default useWebRTC;
