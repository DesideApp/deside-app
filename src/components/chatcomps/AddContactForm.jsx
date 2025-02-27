import React, { useState } from 'react';
import { ensureWalletState } from '../../services/walletStateService';
import { addContact } from '../../services/apiService';

const AddContactForm = ({ onContactAdded }) => {
    const [pubkey, setPubkey] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ✅ **Enviar solicitud de contacto**
    const handleAddContact = async () => {
        if (!pubkey.trim()) {
            setErrorMessage('⚠️ Introduce una clave pública válida.');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const status = await ensureWalletState(); // ✅ **Asegurar autenticación**
            if (!status.isAuthenticated) {
                throw new Error('⚠️ Debes estar autenticado para añadir contactos.');
            }

            await addContact(pubkey);
            setSuccessMessage('✅ Solicitud de contacto enviada con éxito.');
            setPubkey('');
            onContactAdded();
        } catch (error) {
            console.error('❌ Error enviando la solicitud:', error);
            setErrorMessage(error.message || '❌ Error al enviar solicitud.');
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
                onChange={(e) => {
                    setPubkey(e.target.value);
                    setErrorMessage('');
                    setSuccessMessage('');
                }}
                placeholder="Introduce la clave pública"
                disabled={isLoading}
            />

            <button onClick={handleAddContact} disabled={isLoading}>
                {isLoading ? 'Enviando...' : '➕ Enviar Solicitud'}
            </button>

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
        </div>
    );
};

export default AddContactForm;
