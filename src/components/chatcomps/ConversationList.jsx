import React, { useState, memo } from "react";
import { FaSearch } from "react-icons/fa";
import "./ConversationList.css";

const formatPubkey = (pubkey) => {
  if (!pubkey) return "";
  return `${pubkey.slice(0, 6)}...${pubkey.slice(-4)}`;
};

const ConversationList = ({
  conversations = [],
  onConversationSelected,
  loading = false,
  error = null,
  onRefresh,
  selectedPubkey = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Filtrar conversaciones por nickname o pubkey
  const filteredConversations = conversations.filter((conv) => {
    const term = searchTerm.toLowerCase();
    return (
      (conv.nickname && conv.nickname.toLowerCase().includes(term)) ||
      conv.pubkey?.toLowerCase().includes(term)
    );
  });

  // ✅ Ordenar por timestamp descendente
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    return (b.timestamp || 0) - (a.timestamp || 0);
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
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="refresh-button"
            aria-label="Refresh conversations"
          >
            🔄
          </button>
        )}
      </div>

      {loading && <p className="loading-text">Loading conversations...</p>}
      {error && <p className="error-text">❌ {error}</p>}

      {!loading && !error && sortedConversations.length > 0 && (
        <ul className="conversation-list">
          {sortedConversations.map((conv) => {
            const isUnread = conv.unreadCount > 0;

            return (
              <li
                key={conv.pubkey}
                className={`conversation-item ${
                  selectedPubkey === conv.pubkey ? "active" : ""
                } ${isUnread ? "unread" : ""}`}
                onClick={() =>
                  onConversationSelected && onConversationSelected(conv.pubkey)
                }
              >
                {conv.avatar && (
                  <img
                    src={conv.avatar}
                    alt="avatar"
                    className="conversation-avatar"
                  />
                )}
                <div className="conversation-info">
                  <span className={`conversation-name ${isUnread ? "bold" : ""}`}>
                    {conv.nickname
                      ? `${conv.nickname} (${formatPubkey(conv.pubkey)})`
                      : formatPubkey(conv.pubkey)}
                  </span>
                  <span
                    className={`conversation-last-message ${
                      isUnread ? "bold" : ""
                    }`}
                  >
                    {conv.lastMessage?.slice(0, 50) || "No messages yet."}
                  </span>
                </div>
                <span className="conversation-time">
                  {conv.timestamp
                    ? new Date(conv.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
                {isUnread && (
                  <span className="conversation-unread-badge">
                    {conv.unreadCount}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {!loading && !error && sortedConversations.length === 0 && (
        <p className="no-conversations">No conversations found.</p>
      )}
    </div>
  );
};

export default memo(ConversationList);
