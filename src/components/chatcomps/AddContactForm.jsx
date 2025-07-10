import React, { memo } from "react";
import { FaCheckCircle, FaTimes } from "react-icons/fa";
import { ChevronDown, ChevronUp } from "lucide-react";
import useAddContactManager from "../../hooks/useAddContactManager";
import "./AddContactForm.css";

const formatPubkey = (wallet) => {
  if (!wallet) return "";
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
};

const AddContactForm = ({ onContactAdded }) => {
  const {
    pubkey,
    setPubkey,
    isValidPubkey,
    isLoading,
    textareaRef,
    handleAddContact,
    sentRequests,
    isExpanded,
    setIsExpanded,
    clearInput,
  } = useAddContactManager(onContactAdded);

  const handleClear = () => {
    clearInput();
    textareaRef.current?.focus();
  };

  return (
    <div className="add-contact-container">
      <h2 className="contact-title">Add Contact</h2>

      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          value={pubkey}
          onChange={(e) => setPubkey(e.target.value.slice(0, 88))}
          placeholder="Friend's Wallet"
          disabled={isLoading}
          aria-label="Friend's wallet pubkey"
        />
        <div className="input-icons">
          <span
            className={`validation-icon ${isValidPubkey ? "valid" : "inactive"}`}
            aria-label={isValidPubkey ? "Valid pubkey" : "Invalid pubkey"}
          >
            <FaCheckCircle />
          </span>
          {pubkey && (
            <span
              className="clear-icon"
              onClick={handleClear}
              aria-label="Clear input"
            >
              <FaTimes />
            </span>
          )}
        </div>
      </div>

      <button
        className={`send-request-button ${isValidPubkey ? "active" : "inactive"}`}
        onClick={handleAddContact}
        disabled={isLoading || !isValidPubkey}
        aria-label="Send contact request"
      >
        {isLoading ? "Sending..." : "Send request"}
      </button>

      <div
        className={`sent-requests-wrapper ${
          isExpanded ? "expanded" : "collapsed"
        }`}
      >
        <div
          className="toggle-sent-section"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Collapse sent requests" : "Expand sent requests"}
        >
          <span className="toggle-label">Sent Requests</span>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {isExpanded && (
          <div className="sent-requests-box">
            {sentRequests.length > 0 ? (
              <ul className="requests-list">
                {sentRequests.map(({ wallet }) => (
                  <li key={wallet}>
                    {formatPubkey(wallet)} (Pending)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-requests">No sent requests.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(AddContactForm);
