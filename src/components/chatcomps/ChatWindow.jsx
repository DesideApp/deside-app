import React, { useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import { useWallet } from "../../contexts/WalletContext"; // ✅ Contexto Global
import useWebRTC from "../../hooks/useWebRTC";
import { io } from "socket.io-client";
import { checkAuthStatus } from "../../services/authServices.js"; // ✅ Validación de autenticación desde el backend
import "./ChatWindow.css";

// ✅ Conexión WebSocket con credenciales
const socket = io(import.meta.env.VITE_API_BASE_URL, {
  transports: ["websocket"],
  withCredentials: true,
});

function ChatWindow({ selectedContact }) {
  const { walletAddress, walletStatus } = useWallet(); // ✅ Obtener estado de la wallet
  const chatContainerRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // ✅ Estado validado desde el backend

  // ✅ Inicializar WebRTC solo si la wallet está autenticada y conectada
  const { messages, sendMessage } = useWebRTC(
    selectedContact,
    walletAddress,
    walletStatus === "authenticated"
  );

  // ✅ Validar autenticación antes de permitir interacciones
  useEffect(() => {
    const verifyAuth = async () => {
      if (walletStatus === "authenticated" && walletAddress) {
        const status = await checkAuthStatus();
        setIsAuthenticated(status.isAuthenticated);

        if (status.isAuthenticated) {
          socket.emit("register_wallet", walletAddress);
        }
      }
    };

    verifyAuth();
  }, [walletStatus, walletAddress]);

  // ✅ Manejo de eventos WebSocket
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("🟢 Conectado al servidor WebSocket");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.warn("🔴 Desconectado del servidor WebSocket");
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ✅ Mantener scroll en el último mensaje recibido
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-window">
      {!selectedContact ? (
        <p className="chat-placeholder">🔍 Selecciona un contacto para empezar a chatear.</p>
      ) : (
        <>
          <div className="chat-header">
            <h3>
              💬 Chat con:{" "}
              <span title={selectedContact}>
                {selectedContact.slice(0, 6)}...{selectedContact.slice(-4)}
              </span>
            </h3>
            <p className={`connection-status ${isConnected ? "connected" : "disconnected"}`}>
              {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}
            </p>
          </div>

          <div className="chat-messages" ref={chatContainerRef}>
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.sender === "me" ? "sent" : "received"}`}>
                  {msg.text}
                </div>
              ))
            ) : (
              <p className="no-messages">🔹 No hay mensajes todavía.</p>
            )}
          </div>

          {/* ✅ Solo permite enviar mensajes si está autenticado y conectado */}
          <ChatInput
            onSendMessage={sendMessage}
            disabled={!isAuthenticated || !isConnected}
          />
        </>
      )}
    </div>
  );
}

export default ChatWindow;
