import React, { useEffect, useRef, useState, useCallback } from "react";
import ChatInput from "./ChatInput";
import { useWallet } from "../../contexts/WalletContext";
import useWebRTC from "../../hooks/useWebRTC";
import { io } from "socket.io-client";
import { checkAuthStatus, getContacts } from "../../services/apiService.js";
import "./ChatWindow.css";

function ChatWindow({ selectedContact }) {
  const { walletAddress } = useWallet();
  const chatContainerRef = useRef(null);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [confirmedContacts, setConfirmedContacts] = useState([]);

  // ✅ **Obtener lista de contactos confirmados**
  const fetchContacts = useCallback(async () => {
    if (!walletAddress) return;
    try {
      const contacts = await getContacts();
      setConfirmedContacts(contacts.confirmed.map((c) => c.wallet));
    } catch (error) {
      console.error("❌ Error obteniendo contactos:", error);
    }
  }, [walletAddress]);

  // ✅ **Verificar autenticación con el backend**
  const verifyAuth = useCallback(async () => {
    if (!walletAddress) return;
    try {
      const status = await checkAuthStatus();
      setIsAuthenticated(status.isAuthenticated);
    } catch (error) {
      console.error("❌ Error verificando autenticación:", error);
      setIsAuthenticated(false);
    }
  }, [walletAddress]);

  // ✅ **Inicializar WebSocket solo si el usuario está autenticado y tiene un contacto confirmado**
  const initializeSocket = useCallback(() => {
    if (!isAuthenticated || !walletAddress || !selectedContact) return;
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
  }, [isAuthenticated, walletAddress, selectedContact, confirmedContacts]);

  // ✅ **Gestionar WebRTC solo si el usuario está autenticado y tiene un contacto confirmado**
  const { messages, sendMessage } = useWebRTC(selectedContact, walletAddress);

  // ✅ **Mantener scroll en el último mensaje recibido**
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ✅ **Efectos de carga de datos**
  useEffect(() => {
    fetchContacts();
    verifyAuth();
  }, [fetchContacts, verifyAuth]);

  // ✅ **Efecto para inicializar WebSocket**
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

  return (
    <div className="chat-window">
      {!selectedContact ? (
        <p className="chat-placeholder">🔍 Selecciona un contacto para empezar a chatear.</p>
      ) : !confirmedContacts.includes(selectedContact) ? (
        <p className="chat-placeholder">❌ No puedes chatear con este usuario.</p>
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

          <ChatInput onSendMessage={sendMessage} disabled={!isAuthenticated || !isConnected} />
        </>
      )}
    </div>
  );
}

export default ChatWindow;
