import React, { useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import { useWallet } from "../../contexts/WalletContext"; // ✅ USAR CONTEXTO GLOBAL
import useWebRTC from "../../hooks/useWebRTC";
import "./ChatWindow.css";

function ChatWindow({ selectedContact }) {
  const { walletAddress, walletStatus } = useWallet(); // ✅ Obtener estado desde el contexto global
  const chatContainerRef = useRef(null);

  // ✅ Evitar inicialización prematura de WebRTC
  const isWalletAuthenticated = walletStatus === "authenticated";

  // ✅ Inicializar WebRTC solo si la wallet está autenticada
  const { messages, sendMessage } = useWebRTC(
    selectedContact,
    isWalletAuthenticated ? walletAddress : null,
    isWalletAuthenticated
  );

  // ✅ Mantener el scroll en el último mensaje solo si hay mensajes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ✅ Evitar renderizar el componente si la wallet aún no está lista
  if (!walletAddress || walletStatus === "not_connected") {
    return <p className="chat-placeholder">🔒 Esperando conexión de la wallet...</p>;
  }

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
          </div>

          <div className="chat-messages" ref={chatContainerRef}>
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-message ${
                    msg.sender === "me" ? "sent" : "received"
                  }`}
                >
                  {msg.text}
                </div>
              ))
            ) : (
              <p className="no-messages">🔹 No hay mensajes todavía.</p>
            )}
          </div>

          {/* ✅ Deshabilitar ChatInput si la wallet no está autenticada */}
          <ChatInput
            onSendMessage={sendMessage}
            disabled={!isWalletAuthenticated}
          />
        </>
      )}
    </div>
  );
}

export default ChatWindow;
