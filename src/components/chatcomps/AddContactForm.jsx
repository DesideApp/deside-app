import React, { useState, useCallback, memo } from "react";
import { checkAuthStatus } from "../../services/apiService.js";
import { sendContactRequest } from "../../services/contactService.js"; // ✅ Nuevo import correcto


const AddContactForm = ({ onContactAdded }) => {
    const [pubkey, setPubkey] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(false);

    // ✅ **Manejo de solicitudes de contacto**
    const handleAddContact = useCallback(async () => {
        const trimmedPubkey = pubkey.trim();
        if (!trimmedPubkey) {
            setMessage({ type: "error", text: "⚠️ Introduce una clave pública válida." });
            return;
        }

        setIsLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const { isAuthenticated } = await checkAuthStatus();
            if (!isAuthenticated) throw new Error("⚠️ Debes estar autenticado para añadir contactos.");

            await sendContactRequest(trimmedPubkey);
            setMessage({ type: "success", text: "✅ Solicitud de contacto enviada con éxito." });
            setPubkey(""); // ✅ Reset del input tras el éxito
            onContactAdded();
        } catch (error) {
            console.error("❌ Error enviando la solicitud:", error);
            setMessage({ type: "error", text: error.message || "❌ Error al enviar solicitud." });
        } finally {
            setIsLoading(false);
        }
    }, [pubkey, onContactAdded]);

    return (
        <div className="add-contact-container">
            <h2>📇 Añadir Contacto</h2>

            <input
                type="text"
                value={pubkey}
                onChange={(e) => setPubkey(e.target.value)}
                placeholder="Introduce la clave pública"
                disabled={isLoading}
                aria-disabled={isLoading}
                aria-label="Clave pública del contacto"
            />

            <button onClick={handleAddContact} disabled={isLoading} aria-disabled={isLoading}>
                {isLoading ? "Enviando..." : "➕ Enviar Solicitud"}
            </button>

            {/* ✅ Mejora de accesibilidad con `aria-live` */}
            {message.text && (
                <p className={`message ${message.type}`} aria-live="assertive">{message.text}</p>
            )}
        </div>
    );
};

export default memo(AddContactForm);
