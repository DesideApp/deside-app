import { useEffect, useRef, useState, useCallback } from "react";
import { signMessageForLogin } from "../services/walletService.js";
import { apiRequest as fetchWithAuth } from "../services/apiService.js";

const useWebRTC = (selectedContact, onIceCandidate) => {
  const peerRef = useRef(null);
  const dataChannelRef = useRef(null);
  const isReconnecting = useRef(false);

  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("idle");
  const [isDataChannelReady, setIsDataChannelReady] = useState(false);

  const pubkey = selectedContact?.pubkey || selectedContact;

  /**
   * ✅ Verifica si el contacto está confirmado
   */
  const validateContactStatus = useCallback(async () => {
    if (!pubkey) return false;
    try {
      const response = await fetchWithAuth(`/api/contacts/status/${pubkey}`);
      return response?.isConfirmed;
    } catch (err) {
      console.error("❌ Error checking contact status:", err);
      return false;
    }
  }, [pubkey]);

  /**
   * ✅ Inicializa WebRTC como initiator o receptor
   */
  const initializeWebRTC = useCallback(
    async (initiator = false) => {
      if (peerRef.current) {
        console.log("🔵 WebRTC ya inicializado.");
        return;
      }

      if (!(await validateContactStatus())) {
        console.warn("⚠️ Contacto no confirmado, no se puede iniciar WebRTC.");
        return;
      }

      console.log("🔵 Inicializando WebRTC con", pubkey, "initiator:", initiator);

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("📡 Local ICE candidate generado:", event.candidate);
          onIceCandidate?.({
            type: "ice-candidate",
            candidate: event.candidate,
          });
        }
      };

      peer.oniceconnectionstatechange = () => {
        console.log("ICE state:", peer.iceConnectionState);
        if (peer.iceConnectionState === "disconnected" && !isReconnecting.current) {
          console.warn("⚠️ WebRTC desconectado. Reintentando...");
          isReconnecting.current = true;
          attemptReconnection();
        }
      };

      if (initiator) {
        const dataChannel = peer.createDataChannel("chat");
        attachDataChannelHandlers(dataChannel);
      } else {
        peer.ondatachannel = (e) => {
          attachDataChannelHandlers(e.channel);
        };
      }

      peerRef.current = peer;
    },
    [validateContactStatus, pubkey, onIceCandidate]
  );

  /**
   * ✅ Handlers para DataChannel
   */
  const attachDataChannelHandlers = (channel) => {
    dataChannelRef.current = channel;

    channel.onopen = () => {
      console.log("✅ DataChannel abierto.");
      setConnectionStatus("connected");
      setIsDataChannelReady(true);
    };

    channel.onclose = () => {
      console.log("🔴 DataChannel cerrado.");
      setConnectionStatus("disconnected");
      setIsDataChannelReady(false);
    };

    channel.onerror = (e) => {
      console.error("❌ DataChannel error:", e);
    };

    channel.onmessage = (e) => {
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
        console.error("❌ Error parsing WebRTC message:", error);
        setMessages((prev) => [
          ...prev,
          { sender: "peer", text: e.data },
        ]);
      }
    };
  };

  /**
   * ✅ Crea una Offer y devuelve su descripción
   */
  const createOffer = useCallback(async () => {
    if (!peerRef.current) return null;
    if (peerRef.current.signalingState !== "stable") {
      console.warn("❌ Peer signaling state no es stable. No se crea offer.");
      return null;
    }
    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);
    return offer;
  }, []);

  /**
   * ✅ Crea una Answer y devuelve su descripción
   */
  const createAnswer = useCallback(async () => {
    if (!peerRef.current) return null;
    if (peerRef.current.signalingState !== "have-remote-offer") {
      console.warn("❌ Peer signaling state no es have-remote-offer. No se crea answer.");
      return null;
    }
    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);
    return answer;
  }, []);  

  /**
   * ✅ Procesa señal remota
   */
  const handleRemoteSignal = useCallback(
    async (signal) => {
      if (!peerRef.current) await initializeWebRTC(false);

      const peer = peerRef.current;

      if (signal.type === "offer") {
        await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        const answer = await createAnswer();
        return {
          type: "answer",
          sdp: answer,
        };
      } else if (signal.type === "answer") {
        await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      } else if (signal.type === "ice-candidate") {
        await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    },
    [initializeWebRTC, createAnswer]
  );

  /**
   * ✅ Reconexión automática
   */
  const attemptReconnection = useCallback(async () => {
    console.log("🔄 Intentando reconexión WebRTC...");
    if (await validateContactStatus()) {
      peerRef.current = null;
      dataChannelRef.current = null;
      await initializeWebRTC(true);
      const offer = await createOffer();
      isReconnecting.current = false;
      return offer;
    } else {
      console.warn("❌ No se puede reconectar. Contacto no confirmado.");
    }
  }, [validateContactStatus, initializeWebRTC, createOffer]);

  /**
   * ✅ Envía mensaje firmado
   */
  const sendMessage = useCallback(
    async (messageObject) => {
      if (!(await validateContactStatus())) {
        console.warn("❌ Contacto no confirmado, no se envía mensaje.");
        return;
      }

      if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") {
        console.error("❌ DataChannel no abierto.");
        return;
      }

      try {
        const signed = await signMessageForLogin(messageObject.text || "");
        const payload = {
          ...messageObject,
          signature: signed.signature,
          pubkey: signed.pubkey,
          signedMessage: signed.message,
          isSigned: true,
          isBackedUp: false,
        };

        dataChannelRef.current.send(JSON.stringify(payload));

        setMessages((prev) => [
          ...prev,
          {
            sender: "me",
            ...payload,
          },
        ]);
      } catch (err) {
        console.error("❌ Error firmando o enviando mensaje:", err);
      }
    },
    [validateContactStatus]
  );

  /**
   * ✅ Cleanup
   */
  useEffect(() => {
    return () => {
      if (peerRef.current) {
        console.log("🔴 Cerrando WebRTC...");
        peerRef.current.close();
        peerRef.current = null;
      }
      if (dataChannelRef.current) {
        dataChannelRef.current.close();
        dataChannelRef.current = null;
      }
      setMessages([]);
      setIsDataChannelReady(false);
      setConnectionStatus("idle");
    };
  }, []);

  return {
    messages,
    connectionStatus,
    isDataChannelReady,
    sendMessage,
    handleRemoteSignal,
    initializeWebRTC,
    createOffer,
  };
};

export default useWebRTC;
