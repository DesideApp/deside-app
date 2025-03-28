import React, { useEffect, useRef, useState, useCallback } from "react";
import WrittingPanel from "./WrittingPanel";
import useWebRTC from "../../hooks/useWebRTC";
import { io } from "socket.io-client";
import "./ChatWindow.css";

function ChatWindow({ selectedContact }) {
  const chatContainerRef = useRef(null);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [confirmedContacts, setConfirmedContacts] = useState([]);

  // ✅ Obtener contactos confirmados desde el backend
  const fetchContacts = useCallback(async () => {
    try {
      const contacts = await getContacts();
      setConfirmedContacts(contacts.confirmed.map((c) => c.wallet));
    } catch (error) {
      console.error("❌ Error obteniendo contactos:", error);
    }
  }, []);

  // ✅ Inicializar WebSocket solo con contacto confirmado
  const initializeSocket = useCallback(() => {
    if (!selectedContact) return;
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
    });

    socket.on("disconnect", () => {
      console.warn("🔴 Desconectado del servidor WebSocket");
      setIsConnected(false);
    });

    socketRef.current = socket;
  }, [selectedContact, confirmedContacts]);

  // ✅ Chat y mensajes (WebRTC)
  const { messages, sendMessage } = useWebRTC(selectedContact);

  // ✅ Scroll automático al nuevo mensaje
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ✅ Cargar contactos confirmados al montar
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

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
          <h3 className="chat-header-placeholder">💬 Select a contact</h3>
        )}
        <p className={`connection-status ${isConnected ? "connected" : "disconnected"}`}>
          {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </p>
      </header>

      <main className="chat-messages" ref={chatContainerRef}>
        {selectedContact ? (
          messages.length > 0 ? (
            messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender === "me" ? "sent" : "received"}`}>
                {msg.text}
              </div>
            ))
          ) : (
            <p className="no-messages">🔹 No messages yet.</p>
          )
        ) : (
          <p className="chat-placeholder">🔍 Select a contact to start chatting.</p>
        )}
      </main>

      <div className="writting-panel-container">
        <WrittingPanel onSendMessage={sendMessage} disabled={!isConnected} />
      </div>
    </>
  );
}

export default ChatWindow;
