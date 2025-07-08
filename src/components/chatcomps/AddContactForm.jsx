import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import { checkAuthStatus } from "../../services/apiService.js";
import { sendContactRequest, fetchContacts } from "../../services/contactService.js";
import { searchUserByPubkey } from "../../services/userService.js";
import { notify } from "../../services/notificationService.js";
import { FaCheckCircle, FaTimes } from "react-icons/fa";
import { ChevronDown, ChevronUp } from "lucide-react";
import "./AddContactForm.css";

const AddContactForm = ({ onContactAdded }) => {
  const [pubkey, setPubkey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);

  const isValidPubkey = /^([1-9A-HJ-NP-Za-km-z]{32,44})$/.test(pubkey.trim());

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "50px";
      if (textarea.scrollHeight > textarea.clientHeight) {
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }
  }, [pubkey]);

  useEffect(() => {
    let isMounted = true;

    const fetchSentRequests = async () => {
      try {
        const contacts = await fetchContacts();
        if (isMounted) {
          setSentRequests(contacts.outgoing || []);
        }
      } catch (error) {
        console.error("❌ Error al obtener solicitudes enviadas:", error);
      }
    };

    fetchSentRequests();
    return () => {
      isMounted = false;
    };
  }, []);

  const clearInput = () => setPubkey("");

  const handleAddContact = useCallback(async () => {
    const trimmedPubkey = pubkey.trim();

    if (!/^([1-9A-HJ-NP-Za-km-z]{32,44})$/.test(trimmedPubkey)) {
      notify("❌ Clave pública inválida.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const { isAuthenticated } = await checkAuthStatus();
      if (!isAuthenticated) {
        notify("⚠️ You must be logged in to add contacts.", "error");
        return;
      }

      const result = await searchUserByPubkey(trimmedPubkey);

      if (result.error) {
        notify(result.message, "error");
        return;
      }

      if (!result.registered) {
        notify("⚠️ This wallet is not registered on Deside.", "error");
        return;
      }

      if (result.relationship === "confirmed") {
        notify("⚠️ This user is already your contact.", "info");
        return;
      }

      if (result.relationship === "pending") {
        notify("⚠️ You already have a pending request with this user.", "info");
        return;
      }

      if (result.blocked) {
        notify("⚠️ This user is blocked.", "error");
        return;
      }

      // ✅ Mostrar nickname si existe
      if (result.nickname) {
        notify(`✅ User found: ${result.nickname}`, "success");
      } else {
        notify("✅ User found.", "success");
      }

      await sendContactRequest(trimmedPubkey);
      notify("✅ Request sent successfully.", "success");
      setPubkey("");
      onContactAdded();

      // ✅ Refrescar lista de solicitudes enviadas tras enviar
      const contacts = await fetchContacts();
      setSentRequests(contacts.outgoing || []);
    } catch (error) {
      console.error("❌ Error sending request:", error);
      notify("❌ Error sending request.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [pubkey, onContactAdded]);

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
        />
        <div className="input-icons">
          <span className={`validation-icon ${isValidPubkey ? "valid" : "inactive"}`}>
            <FaCheckCircle />
          </span>
          {pubkey && (
            <span className="clear-icon" onClick={clearInput}>
              <FaTimes />
            </span>
          )}
        </div>
      </div>

      <button
        className={`send-request-button ${isValidPubkey ? "active" : "inactive"}`}
        onClick={handleAddContact}
        disabled={isLoading || !isValidPubkey}
      >
        {isLoading ? "Sending..." : "Send request"}
      </button>

      {/* Sent Requests List */}
      <div className={`sent-requests-wrapper ${isExpanded ? "expanded" : "collapsed"}`}>
        <div className="toggle-sent-section" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="toggle-label">Sent Requests</span>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {isExpanded && (
          <div className="sent-requests-box">
            {sentRequests.length > 0 ? (
              <ul className="requests-list">
                {sentRequests.map(({ wallet }) => (
                  <li key={wallet}>
                    {wallet.slice(0, 6)}...{wallet.slice(-4)} (Pending)
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
