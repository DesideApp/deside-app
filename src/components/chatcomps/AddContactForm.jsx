import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import { checkAuthStatus, checkWalletRegistered } from "../../services/apiService.js";
import { sendContactRequest } from "../../services/contactService.js";
import { FaCheckCircle, FaTimes } from "react-icons/fa"; // ✅ Se mantiene la cruz para borrar, validación mejorada
import "./AddContactForm.css";

const AddContactForm = ({ onContactAdded }) => {
    const [pubkey, setPubkey] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(false);
    const textareaRef = useRef(null);

    /** 🔹 **Expresión regular para validar pubkey de Solana** */
    const isValidPubkey = pubkey.length === 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(pubkey.trim());

    /** 🔹 **Ajustar altura dinámica del textarea SOLO cuando se complete una línea** */
    useEffect(() => {
        if (textareaRef.current) {
            const textarea = textareaRef.current;
            textarea.style.height = "50px"; // 🔥 Establecer altura inicial mínima

            // 🔥 Detectar si el contenido excede una línea
            if (textarea.scrollHeight > textarea.clientHeight) {
                textarea.style.height = `${textarea.scrollHeight}px`;
            }
        }
    }, [pubkey]);

    /** 🔹 **Limpiar campo de entrada** */
    const clearInput = () => setPubkey("");

    /** 🔹 **Manejo de solicitudes de contacto** */
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

            {/* 🔹 Contenedor del input con validación y espacio para iconos */}
            <div className="input-wrapper">
                <textarea
                    ref={textareaRef}
                    value={pubkey}
                    onChange={(e) => setPubkey(e.target.value.slice(0, 88))}
                    placeholder="Friend's Wallet"
                    disabled={isLoading}
                />
                <div className="input-icons">
                    {/* 🔹 Icono de validación (siempre presente, pero gris cuando no es válido) */}
                    <span className={`validation-icon ${isValidPubkey ? "valid" : "inactive"}`}>
                        <FaCheckCircle />
                    </span>
                    {/* 🔹 Icono para borrar */}
                    {pubkey && (
                        <span className="clear-icon" onClick={clearInput}>
                            <FaTimes />
                        </span>
                    )}
                </div>
            </div>

            {/* 🔹 Botón de agregar */}
            <button
                className={`send-request-button ${isValidPubkey ? "active" : "inactive"}`}
                onClick={handleAddContact}
                disabled={isLoading || !isValidPubkey}
            >
                {isLoading ? "Sending..." : "Send request"}
            </button>

            {/* ✅ Mensajes de estado */}
            {message.text && (
                <p className={`message ${message.type}`} aria-live="assertive">{message.text}</p>
            )}
        </div>
    );
};

export default memo(AddContactForm);
