import React, { useState, memo } from "react";
import { FaSearch } from "react-icons/fa";
import "./ContactList.css";

const formatPubkey = (wallet) => {
  if (!wallet) return "";
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
};

const ContactList = ({
  confirmedContacts = [],
  onContactSelected,
  selectedWallet = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContacts = confirmedContacts.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      (c.nickname && c.nickname.toLowerCase().includes(term)) ||
      c.wallet?.toLowerCase().includes(term)
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
                {c.nickname
                  ? `${c.nickname} (${formatPubkey(c.wallet)})`
                  : formatPubkey(c.wallet)}
              </span>
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
