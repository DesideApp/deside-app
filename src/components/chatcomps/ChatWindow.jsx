import React, { useEffect, useRef, useState, useCallback } from "react";
import ChatInput from "./ChatInput";
import { useServerContext } from "../../contexts/ServerContext"; // ✅ Usamos ServerContext
import useWebRTC from "../../hooks/useWebRTC";
import { io } from "socket.io-client";
import { useAuthManager } from "../../services/authManager"; // ✅ Usamos AuthManager
import "./ChatWindow.css";

function ChatWindow({ selectedContact }) {
  const { walletAddress } = useServerContext(); // ✅ Nuevo contexto
  const chatContainerRef = useRef(null);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [confirmedContacts, setConfirmedContacts] = useState([]);

  // ✅ **Usamos AuthManager para gestionar el estado de autenticación**
  const { isAuthenticated, handleLoginResponse } = useAuthManager();

  // ✅ **Obtener lista de contactos confirmados**
  const fetchContacts = useCallback(async () => {
    if (!walletAddress || !isAuthenticated) return; // ✅ Solo si el usuario está autenticado
    try {
      const contacts = await getContacts();
      setConfirmedContacts(contacts.confirmed.map((c) => c.wallet));
    } catch (error) {
      console.error("❌ Error obteniendo contactos:", error);
    }
  }, [walletAddress, isAuthenticated]);

  // ✅ **Inicializar WebSocket solo si el usuario tiene un contacto confirmado**
  const initializeSocket = useCallback(() => {
    if (!walletAddress || !selectedContact || !isAuthenticated) return;

    if (!confirmedContacts.includes(selectedContact)) {
      console.warn("⚠️ Intento de chat con un contacto no confirmado.");
      return;
    }

    if (socketRef.current) {
      console.log("⚡ WebSocket ya está conectado, evitando reconexión.");
      return;
    }

    console.log("🔵 Conectando a WebSocket...");
    const socket = io(import.meta.env.VITE_WEBSOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("🟢 Conectado al servidor WebSocket");
      setIsConnected(true);
      socket.emit("register_wallet", walletAddress);
    });

    socket.on("disconnect", () => {
      console.warn("🔴 Desconectado del servidor WebSocket");
      setIsConnected(false);
    });

    socketRef.current = socket;
  }, [walletAddress, selectedContact, confirmedContacts, isAuthenticated]);

  // ✅ **Gestionar WebRTC solo si el usuario tiene un contacto confirmado**
  const { messages, sendMessage } = useWebRTC(selectedContact, walletAddress);

  // ✅ **Mantener scroll en el último mensaje recibido**
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ✅ **Cargar contactos al inicio**
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // ✅ **Inicializar WebSocket**
  useEffect(() => {
    initializeSocket();
    return () => {
      if (socketRef.current) {
        console.log("🔴 Desconectando WebSocket...");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [initializeSocket]);

  // ✅ **Manejo de la interacción de usuario**
  const handleSendMessage = () => {
    if (!isAuthenticated) {
      console.warn("⚠️ Intento de enviar mensaje sin autenticación. Activando login...");
      handleLoginResponse(); // 🔄 Activa autenticación automática
      return;
    }
    sendMessage(selectedContact, walletAddress);
  };

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

          <ChatInput onSendMessage={handleSendMessage} disabled={!isConnected} />
        </>
      )}
    </div>
  );
}

export default ChatWindow;
