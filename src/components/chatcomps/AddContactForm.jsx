import React, { useState } from "react";
import { ensureWalletState } from "../../services/walletService.js";
import { addContact } from "../../services/apiService.js";

const AddContactForm = ({ onContactAdded }) => {
    const [pubkey, setPubkey] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // ✅ **Enviar solicitud de contacto**
    const handleAddContact = async () => {
        const trimmedPubkey = pubkey.trim();
        if (!trimmedPubkey) {
            setErrorMessage("⚠️ Introduce una clave pública válida.");
            return;
        }

        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const { isAuthenticated } = await ensureWalletState(); // ✅ **Validar autenticación correctamente**
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
    };

    return (
        <div className="add-contact-container">
            <h2>📇 Añadir Contacto</h2>

            <input
                type="text"
                value={pubkey}
                onChange={(e) => setPubkey(e.target.value)}
                placeholder="Introduce la clave pública"
                disabled={isLoading}
            />

            <button onClick={handleAddContact} disabled={isLoading}>
                {isLoading ? "Enviando..." : "➕ Enviar Solicitud"}
            </button>

            {/* ✅ Mejora de accesibilidad con `aria-live` */}
            {errorMessage && <p className="error-message" aria-live="polite">{errorMessage}</p>}
            {successMessage && <p className="success-message" aria-live="polite">{successMessage}</p>}
        </div>
    );
};

export default AddContactForm;
