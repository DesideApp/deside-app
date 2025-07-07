import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import { checkAuthStatus, checkWalletRegistered } from "../../services/apiService.js";
import { sendContactRequest, fetchContacts } from "../../services/contactService.js";
import { FaCheckCircle, FaTimes } from "react-icons/fa";
import { ChevronDown, ChevronUp } from "lucide-react";
import "./AddContactForm.css";

const AddContactForm = ({ onContactAdded }) => {
    const [pubkey, setPubkey] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [sentRequests, setSentRequests] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const textareaRef = useRef(null);

    const isValidPubkey = pubkey.length === 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(pubkey.trim());

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
        if (!isValidPubkey) return;

        setIsLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const { isAuthenticated } = await checkAuthStatus();
            if (!isAuthenticated) throw new Error("⚠️ You must be logged in to add contacts.");

            const { registered } = await checkWalletRegistered(pubkey);
            if (!registered) throw new Error("⚠️ This wallet is not registered on Deside.");

            await sendContactRequest(pubkey);
            setMessage({ type: "success", text: "✅ Request sent successfully." });
            setPubkey("");
            onContactAdded();
        } catch (error) {
            console.error("❌ Error sending request:", error);
            let errorMsg = "❌ Error sending request.";

            if (error.message.includes("logged in")) errorMsg = "⚠️ You must be logged in to add contacts.";
            if (error.message.includes("registered")) errorMsg = "⚠️ This wallet is not registered on Deside.";

            setMessage({ type: "error", text: errorMsg });
        } finally {
            setIsLoading(false);
        }
    }, [pubkey, onContactAdded, isValidPubkey]);

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

            {message.text && (
                <p className={`message ${message.type}`} aria-live="assertive">{message.text}</p>
            )}

            {/* Contenedor combinado para toggle y lista */}
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
