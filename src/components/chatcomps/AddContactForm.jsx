import React, { useState, useEffect } from 'react';
import { getConnectedWallet, authenticateWallet, connectWallet, isWalletRegistered } from '../../services/walletService';
import { addContact } from '../../services/apiService';

const AddContactForm = ({ onContactAdded }) => {
    const [pubkey, setPubkey] = useState('');
    const [walletStatus, setWalletStatus] = useState({ walletAddress: null, isAuthenticated: false });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setWalletStatus(getConnectedWallet());
    }, []);

    const handleAuthIfNeeded = async () => {
        if (!walletStatus.walletAddress || (window.solana && !window.solana.publicKey)) {
            await connectWallet("phantom");
            setWalletStatus(getConnectedWallet());
        }

        if (!walletStatus.isAuthenticated) {
            console.log("🔑 Autenticando wallet de forma automática...");
            await authenticateWallet("phantom");
            setWalletStatus(getConnectedWallet());
        }
    };

    const handleAddContact = async () => {
        if (!pubkey.trim()) {
            setErrorMessage('⚠️ Introduce una clave pública válida.');
            return;
        }
        if (!walletStatus.walletAddress) {
            setErrorMessage('⚠️ Conéctate a tu wallet antes de agregar contactos.');
            return;
        }

        // Autenticar automáticamente si no está autenticado
        if (!walletStatus.isAuthenticated) {
            await handleAuthIfNeeded();
        }

        try {
            setIsLoading(true);

            // ✅ Validar si la wallet de destino está registrada
            const isRegistered = await isWalletRegistered(pubkey);
            if (!isRegistered) {
                throw new Error('❌ La wallet de destino no está registrada en el sistema.');
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
