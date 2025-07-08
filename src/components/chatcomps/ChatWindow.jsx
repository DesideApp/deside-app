import React, { useEffect, useRef, useState, useCallback } from "react";
import WrittingPanel from "./WrittingPanel";
import ChatMessages from "./ChatMessages";
import useWebRTC from "../../hooks/useWebRTC";
import { io } from "socket.io-client";
import "./ChatWindow.css";

function ChatWindow({ selectedContact }) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const {
    messages,
    sendMessage,
    sendSignal,
    handleRemoteSignal
  } = useWebRTC(selectedContact);

  // ✅ Inicializar WebSocket solo si hay contacto seleccionado
  const initializeSocket = useCallback(() => {
    if (!selectedContact) return;

    if (socketRef.current) {
      console.log("⚡ WebSocket ya está conectado, evitando reconexión.");
      return;
    }

    console.log("🔵 Conectando a WebSocket...");
    setIsConnecting(true);

    const socket = io(import.meta.env.VITE_WEBSOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("🟢 Conectado al servidor WebSocket");
      setIsConnected(true);
      setIsConnecting(false);

      // ✅ Registramos la wallet para identificar este usuario
      socket.emit("register_wallet", selectedContact);
    });

    socket.on("disconnect", () => {
      console.warn("🔴 Desconectado del servidor WebSocket");
      setIsConnected(false);
      setIsConnecting(false);
    });

    // ✅ Recibir señales WebRTC desde el socket
    socket.on("webrtc_signal", ({ from, signal }) => {
      console.log("📡 Señal WebRTC recibida de:", from, signal);
      handleRemoteSignal(signal);
    });

    socketRef.current = socket;
  }, [selectedContact, handleRemoteSignal]);

  // ✅ Enviar señal WebRTC vía WebSocket
  const emitSignal = (signal) => {
    if (socketRef.current && selectedContact) {
      console.log("📤 Enviando señal WebRTC a:", selectedContact, signal);
      socketRef.current.emit("webrtc_signal", {
        to: selectedContact,
        signal,
      });
    }
  };

  // ✅ Conectar socket cuando cambia el contacto
  useEffect(() => {
    if (selectedContact) {
      initializeSocket();
    }

    return () => {
      if (socketRef.current) {
        console.log("🔴 Desconectando WebSocket...");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [initializeSocket, selectedContact]);

  // ✅ Integrar signaling con WebRTC
  useEffect(() => {
    if (!selectedContact) return;
    sendSignal.current = emitSignal;
  }, [selectedContact]);

  return (
    <>
      <header className="chat-header">
        {selectedContact ? (
          <h3>
            💬 Chat with:{" "}
            <span title={selectedContact}>
              {selectedContact.slice(0, 6)}...{selectedContact.slice(-4)}
            </span>
          </h3>
        ) : (
          <h3 className="chat-header-placeholder">
            💬 Select a contact
          </h3>
        )}
        <p
          className={`connection-status ${
            isConnected
              ? "connected"
              : isConnecting
              ? "connecting"
              : "disconnected"
          }`}
        >
          {isConnected
            ? "🟢 Connected"
            : isConnecting
            ? "🟡 Connecting..."
            : "🔴 Disconnected"}
        </p>
      </header>

      <ChatMessages
        messages={messages}
        selectedContact={selectedContact}
      />

      <div className="writting-panel-container">
        <WrittingPanel
          onSendMessage={sendMessage}
          disabled={!isConnected}
        />
      </div>
    </>
  );
}

export default ChatWindow;
