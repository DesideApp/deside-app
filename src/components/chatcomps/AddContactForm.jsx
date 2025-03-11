import React, { useState, useCallback, memo } from "react";
import { checkAuthStatus, checkWalletRegistered } from "../../services/apiService.js";
import { sendContactRequest } from "../../services/contactService.js";
import { FaCheckCircle, FaTimesCircle, FaTimes } from "react-icons/fa"; // ✅ Nuevo icono para borrar campo
import "./AddContactForm.css";

const AddContactForm = ({ onContactAdded }) => {
    const [pubkey, setPubkey] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(false);

    /** 🔹 **Expresión regular para validar pubkey de Solana** */
    const isValidPubkey = pubkey.length === 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(pubkey.trim());

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
            <h2>Add contact</h2>

            {/* 🔹 Contenedor del input con validación y espacio para iconos */}
            <div className="input-wrapper">
                <div className="input-content">
                    <textarea
                        value={pubkey}
                        onChange={(e) => setPubkey(e.target.value.slice(0, 88))} // 🔥 Máximo 88 caracteres
                        placeholder="Friend's public key"
                        disabled={isLoading}
                        aria-disabled={isLoading}
                        aria-label="Contact's public key"
                        rows={1}
                    />
                    <div className="input-icons">
                        {/* 🔹 Icono de validación (Arriba a la derecha) */}
                        {pubkey && (
                            <span className={`validation-icon ${isValidPubkey ? "valid" : "invalid"}`}>
                                {isValidPubkey ? <FaCheckCircle /> : <FaTimesCircle />}
                            </span>
                        )}
                        {/* 🔹 Icono de borrar (Abajo a la derecha) */}
                        {pubkey && (
                            <span className="clear-icon" onClick={clearInput}>
                                <FaTimes />
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* 🔹 Botón de agregar */}
            <button
                className={`wallet-button ${!isValidPubkey ? "disabled" : ""}`}
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
