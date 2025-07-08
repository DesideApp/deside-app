import React, { useState, useEffect, memo } from "react";
import { FaSearch } from "react-icons/fa";
import "./ConversationList.css";

const ConversationList = ({ conversations = [], onConversationSelected }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversations.filter((conv) => {
    const term = searchTerm.toLowerCase();
    return (
      (conv.nickname && conv.nickname.toLowerCase().includes(term)) ||
      conv.pubkey.toLowerCase().includes(term)
    );
  });

  return (
    <div className="conversation-list-container">
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredConversations.length > 0 ? (
        <ul className="conversation-list">
          {filteredConversations.map((conv) => (
            <li
              key={conv.pubkey}
              className="conversation-item"
              onClick={() => onConversationSelected(conv.pubkey)}
            >
              {conv.avatar && (
                <img
                  src={conv.avatar}
                  alt="avatar"
                  className="conversation-avatar"
                />
              )}
              <div className="conversation-info">
                <span className="conversation-name">
                  {conv.nickname
                    ? `${conv.nickname} (${conv.pubkey.slice(0, 6)}...${conv.pubkey.slice(-4)})`
                    : `${conv.pubkey.slice(0, 6)}...${conv.pubkey.slice(-4)}`}
                </span>
                <span className="conversation-last-message">
                  {conv.lastMessage || "No messages yet."}
                </span>
              </div>
              <span className="conversation-time">
                {conv.timestamp ? new Date(conv.timestamp).toLocaleTimeString() : ""}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-conversations">No conversations found.</p>
      )}
    </div>
  );
};

export default memo(ConversationList);
