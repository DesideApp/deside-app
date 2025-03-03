import React, { useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import { useWallet } from "../../contexts/WalletContext";
import useWebRTC from "../../hooks/useWebRTC";
import { io } from "socket.io-client";
import { checkAuthStatus, getContacts } from "../../services/apiService.js"; // ✅ Validación con backend
import "./ChatWindow.css";

function ChatWindow({ selectedContact }) {
  const { walletAddress } = useWallet();
  const chatContainerRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [socket, setSocket] = useState(null);
  const [confirmedContacts, setConfirmedContacts] = useState([]);

  // ✅ Obtener lista de contactos confirmados al cambiar la wallet
  useEffect(() => {
    if (!walletAddress) return;

    const fetchContacts = async () => {
      const contacts = await getContacts();
      setConfirmedContacts(contacts.confirmed.map(c => c.wallet));
    };

    fetchContacts();
  }, [walletAddress]);

  // ✅ Verificar autenticación con el backend
  useEffect(() => {
    if (!walletAddress) return;

    const verifyAuth = async () => {
      const status = await checkAuthStatus();
      setIsAuthenticated(status.isAuthenticated);
    };

    verifyAuth();
  }, [walletAddress]);

  // ✅ Manejo de conexión WebSocket dentro de `useEffect()`
  useEffect(() => {
    if (!isAuthenticated || !walletAddress || !selectedContact) return;

    if (!confirmedContacts.includes(selectedContact)) {
      console.warn("⚠️ Intento de chat con un contacto no confirmado.");
      return;
    }

    const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🟢 Conectado al servidor WebSocket");
      setIsConnected(true);
      newSocket.emit("register_wallet", walletAddress);
    });

    newSocket.on("disconnect", () => {
      console.warn("🔴 Desconectado del servidor WebSocket");
      setIsConnected(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, walletAddress, selectedContact, confirmedContacts]);

  // ✅ Inicializar WebRTC solo si el usuario está autenticado y tiene un contacto confirmado
  const { messages, sendMessage } = useWebRTC(selectedContact, walletAddress);

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
