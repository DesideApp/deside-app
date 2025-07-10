import React, { useEffect, useRef } from "react";
import "./ChatWindow.css";

const formatPubkey = (pubkey) => {
  if (!pubkey) return "";
  return `${pubkey.slice(0, 6)}...${pubkey.slice(-4)}`;
};

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
              {msg.sender !== "me" && msg.sender && (
                <div className="message-sender">
                  {formatPubkey(msg.sender)}
                </div>
              )}

              <div className="message-text">
                {msg.text}
              </div>

              <div className="message-flags">
                {msg.isSigned && (
                  <span className="message-flag" title="Signed Message">
                    ✔️
                  </span>
                )}
                {msg.isBackedUp && (
                  <span className="message-flag" title="Backed Up">
                    💾
                  </span>
                )}
              </div>
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
