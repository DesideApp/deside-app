import React, { useState, useEffect } from 'react';
import { sendContactRequest } from '../../services/contactService';
import { getConnectedWallet, authenticateWallet } from '../../services/walletService';

const AddContactForm = ({ onContactAdded }) => {
    const [pubkey, setPubkey] = useState('');
    const [walletStatus, setWalletStatus] = useState({ walletAddress: null, isAuthenticated: false });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setWalletStatus(getConnectedWallet());
    }, []);

    const handleAddContact = async () => {
        if (!pubkey.trim()) {
            setErrorMessage('⚠️ Introduce una clave pública válida.');
            return;
        }

        if (!walletStatus.walletAddress) {
            setErrorMessage('⚠️ Conéctate a tu wallet antes de agregar contactos.');
            return;
        }

        if (!walletStatus.isAuthenticated) {
            setErrorMessage('⚠️ Se requiere autenticación para agregar contactos.');
            setIsLoading(true);
            await authenticateWallet("phantom");
            setWalletStatus(getConnectedWallet());
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            await sendContactRequest(pubkey);
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

            {!walletStatus.walletAddress ? (
                <p className="error-message">⚠️ Conéctate a tu wallet para añadir contactos.</p>
            ) : !walletStatus.isAuthenticated ? (
                <p className="warning-message">⚠️ Firma con tu wallet para autenticarte.</p>
            ) : null}

            <input
                type="text"
                value={pubkey}
                onChange={(e) => setPubkey(e.target.value)}
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
