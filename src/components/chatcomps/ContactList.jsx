import React, { useState, memo } from "react";
import { FaSearch } from "react-icons/fa";
import "./ContactList.css";

const formatPubkey = (wallet) => {
  if (!wallet) return "";
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
};

const ContactList = ({
  confirmedContacts = [],
  previews = [],
  onContactSelected,
  selectedWallet = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Construir listado unificado
  const contactsMap = {};

  for (const c of confirmedContacts) {
    contactsMap[c.wallet] = {
      ...c,
      isContact: true,
    };
  }

  for (const p of previews) {
    if (!contactsMap[p.chatId]) {
      contactsMap[p.chatId] = {
        wallet: p.chatId,
        nickname: null,
        lastMessageText: p.lastMessageText,
        lastMessageTimestamp: p.lastMessageTimestamp,
        isContact: false,
      };
    }
  }

  const allContacts = Object.values(contactsMap);

  const filteredContacts = allContacts.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      (c.nickname && c.nickname.toLowerCase().includes(term)) ||
      c.wallet?.toLowerCase().includes(term) ||
      c.lastMessageText?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="contact-list-container">
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredContacts.length > 0 ? (
        <ul className="contact-list">
          {filteredContacts.map((c) => (
            <li
              key={c.wallet}
              className={`contact-item ${
                selectedWallet === c.wallet ? "active" : ""
              }`}
              onClick={() =>
                onContactSelected && onContactSelected(c.wallet)
              }
            >
              {c.avatar && (
                <img
                  src={c.avatar}
                  alt="avatar"
                  className="contact-avatar"
                />
              )}
              <span className="contact-name">
                {c.isContact
                  ? `${c.nickname || formatPubkey(c.wallet)}`
                  : `Desconocido (${formatPubkey(c.wallet)})`}
              </span>
              {c.lastMessageText && (
                <span className="contact-preview text-gray-500 text-xs block truncate">
                  {c.lastMessageText}
                </span>
              )}
              {c.isContact && c.premium && (
                <span className="premium-badge ml-2 bg-yellow-400 text-black px-1 rounded text-xs">
                  PREMIUM
                </span>
              )}
              {!c.isContact && (
                <span className="unknown-badge ml-2 bg-red-400 text-white px-1 rounded text-xs">
                  UNKNOWN
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-contacts">No contacts found.</p>
      )}
    </div>
  );
};

export default memo(ContactList);
