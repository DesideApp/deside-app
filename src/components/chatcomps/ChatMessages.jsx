import React, { useEffect, useRef } from "react";
import "./ChatWindow.css";

const ChatMessages = ({ messages, selectedContact }) => {
  const chatContainerRef = useRef(null);

  // ✅ Scroll automático al nuevo mensaje (suave)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <main className="chat-messages" ref={chatContainerRef}>
      {selectedContact ? (
        messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${
                msg.sender === "me" ? "sent" : "received"
              }`}
            >
              {msg.text}
              {/* 🚀 Futuro: flags visuales */}
              {msg.isSigned && <span className="message-flag">✔️</span>}
              {msg.isBackedUp && <span className="message-flag">💾</span>}
            </div>
          ))
        ) : (
          <p className="no-messages">🔹 No messages yet.</p>
        )
      ) : (
        <p className="chat-placeholder">
          🔍 Select a contact to start chatting.
        </p>
      )}
    </main>
  );
};

export default React.memo(ChatMessages);
