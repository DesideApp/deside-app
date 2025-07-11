import React, { useEffect, useRef } from "react";
import "./ChatWindow.css";

const formatPubkey = (pubkey) => {
  if (!pubkey) return "";
  return `${pubkey.slice(0, 6)}...${pubkey.slice(-4)}`;
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const generateMsgKey = (msg, index) => {
  if (msg.id) return msg.id;
  return `${msg.chatId || ""}-${msg.timestamp || ""}-${msg.text || ""}-${index}`;
};

const ChatMessages = ({ messages, selectedContact }) => {
  const chatContainerRef = useRef(null);

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
              key={generateMsgKey(msg, index)}
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

              <div className="message-timestamp text-xs text-gray-400 mt-1">
                {formatTimestamp(msg.timestamp)}
              </div>
            </div>
          ))
        ) : (
          <p className="no-messages text-gray-500 text-center mt-4">
            🔹 No messages yet.
          </p>
        )
      ) : (
        <p className="chat-placeholder text-gray-400 text-center mt-10 text-lg">
          🔍 Select a contact to start chatting.
        </p>
      )}
    </main>
  );
};

export default React.memo(ChatMessages);
