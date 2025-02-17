import React, { useState, useEffect, useCallback } from 'react';
import { getConnectedWallet, authenticateWallet, connectWallet } from '../../services/walletService';
import { addContact } from '../../services/apiService';

const AddContactForm = ({ onContactAdded }) => {
    const [pubkey, setPubkey] = useState('');
    const [walletStatus, setWalletStatus] = useState({ walletAddress: null, isAuthenticated: false });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    // ✅ Actualiza el estado de la wallet automáticamente cuando cambia
    const updateWalletStatus = useCallback(() => {
        setWalletStatus(getConnectedWallet());
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

    // ✅ Manejo de conexión y autenticación
    const handleAuthIfNeeded = async () => {
        try {
            if (!walletStatus.walletAddress) {
                console.log("🔵 Conectando wallet...");
                await connectWallet("phantom");
                updateWalletStatus();
            }
            if (!walletStatus.isAuthenticated) {
                setIsAuthenticating(true);
                console.log("🔑 Autenticando wallet...");
                await authenticateWallet("phantom");
                updateWalletStatus();
                setIsAuthenticating(false);
            }
        } catch (error) {
            console.error("❌ Error en autenticación:", error);
            setErrorMessage("❌ Error al autenticar la wallet.");
            setIsAuthenticating(false);
        }
    };

    // ✅ Manejo de envío de solicitud de contacto
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
            await handleAuthIfNeeded();
        }

        try {
            setIsLoading(true);
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
                disabled={!walletStatus.walletAddress || isLoading || isAuthenticating}
            />
            
            <button 
                onClick={handleAddContact} 
                disabled={isLoading || isAuthenticating || !walletStatus.walletAddress}
            >
                {isLoading ? 'Enviando...' : isAuthenticating ? 'Autenticando...' : '➕ Enviar Solicitud'}
            </button>
            
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
        </div>
    );
};

export default AddContactForm;
