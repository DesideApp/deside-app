import React, { useState, useEffect, useCallback } from 'react';
import { ensureWalletState } from '../../services/walletService';
import { addContact } from '../../services/apiService';

const AddContactForm = ({ onContactAdded }) => {
    const [pubkey, setPubkey] = useState('');
    const [walletStatus, setWalletStatus] = useState({ walletAddress: null, isAuthenticated: false });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ✅ **Actualiza el estado de la wallet cuando cambia**
    const updateWalletStatus = useCallback(async () => {
        const status = await ensureWalletState(); // **Ahora usamos la lógica centralizada**
        setWalletStatus(status || { walletAddress: null, isAuthenticated: false });
    }, []);

    useEffect(() => {
        updateWalletStatus();
        window.addEventListener("walletConnected", updateWalletStatus);
        window.addEventListener("walletDisconnected", updateWalletStatus);

        return () => {
            window.removeEventListener("walletConnected", updateWalletStatus);
            window.removeEventListener("walletDisconnected", updateWalletStatus);
        };
    }, [updateWalletStatus]);

    // ✅ **Enviar solicitud de contacto**
    const handleAddContact = async () => {
        if (!pubkey.trim()) {
            setErrorMessage('⚠️ Introduce una clave pública válida.');
            return;
        }

        setIsLoading(true);

        try {
            // **Nos aseguramos de que la wallet esté lista antes de continuar**
            const status = await ensureWalletState();
            if (!status || !status.walletAddress || !status.isAuthenticated) {
                setErrorMessage('⚠️ Error al conectar o autenticar la wallet.');
                setIsLoading(false);
                return;
            }

            await addContact(pubkey);
            setSuccessMessage('✅ Solicitud de contacto enviada con éxito.');
            setPubkey('');
            setErrorMessage('');
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

            {!walletStatus.walletAddress && (
                <p className="error-message">⚠️ Conéctate a tu wallet para añadir contactos.</p>
            )}

            <input
                type="text"
                value={pubkey}
                onChange={(e) => {
                    setPubkey(e.target.value);
                    setErrorMessage(''); // ✅ Limpia el error al escribir
                    setSuccessMessage('');
                }}
                placeholder="Introduce la clave pública"
                disabled={!walletStatus.walletAddress || isLoading}
            />

            <button 
                onClick={handleAddContact} 
                disabled={isLoading || !walletStatus.walletAddress}
            >
                {isLoading ? 'Enviando...' : '➕ Enviar Solicitud'}
            </button>

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
        </div>
    );
};

export default AddContactForm;
