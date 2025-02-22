import React, { useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import { useWallet } from "../../contexts/WalletContext"; // ✅ USAR CONTEXTO GLOBAL
import useWebRTC from "../../hooks/useWebRTC";
import "./ChatWindow.css";

function ChatWindow({ selectedContact }) {
  const { walletAddress, walletStatus } = useWallet(); // ✅ Obtener estado desde el contexto global
  const chatContainerRef = useRef(null);

  // ✅ **Inicializar WebRTC solo si la wallet está autenticada**
  const { messages, sendMessage } = useWebRTC(
    selectedContact,
    walletAddress,
    walletStatus === "authenticated"
  );

  // ✅ **Evita re-renderizados innecesarios y mantiene el scroll en el último mensaje**
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

          {/* ✅ **Deshabilita ChatInput si la wallet no está autenticada** */}
          <ChatInput
            onSendMessage={sendMessage}
            disabled={walletStatus !== "authenticated"}
          />
        </>
      )}
    </div>
  );
}

export default ChatWindow;
