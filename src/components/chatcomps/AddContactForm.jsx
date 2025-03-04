import React, { useState, useCallback } from "react";
import { checkAuthStatus, addContact } from "../../services/apiService.js";

const AddContactForm = ({ onContactAdded }) => {
    const [pubkey, setPubkey] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // ✅ **Enviar solicitud de contacto**
    const handleAddContact = useCallback(async () => {
        const trimmedPubkey = pubkey.trim();
        if (!trimmedPubkey) {
            setErrorMessage("⚠️ Introduce una clave pública válida.");
            return;
        }

        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const { isAuthenticated } = await checkAuthStatus();
            if (!isAuthenticated) {
                throw new Error("⚠️ Debes estar autenticado para añadir contactos.");
            }

            await addContact(trimmedPubkey);
            setSuccessMessage("✅ Solicitud de contacto enviada con éxito.");
            setPubkey(""); // ✅ Reset del input tras el éxito
            onContactAdded();
        } catch (error) {
            console.error("❌ Error enviando la solicitud:", error);
            setErrorMessage(error.message || "❌ Error al enviar solicitud.");
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
            {errorMessage && <p className="error-message" aria-live="assertive">{errorMessage}</p>}
            {successMessage && <p className="success-message" aria-live="assertive">{successMessage}</p>}
        </div>
    );
};

export default AddContactForm;
