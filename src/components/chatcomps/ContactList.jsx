import React, { useEffect, useCallback } from "react";
import useContactManager from "../../hooks/useContactManager";
import { useWallet } from "../../contexts/WalletContext";
import { useAuthManager } from "../../services/authManager";  // ✅ Importamos AuthManager
import "./ContactList.css";

const ContactList = ({ onSelectContact }) => {
    const { walletAddress, isReady } = useWallet();
    const { isAuthenticated, isLoading, handleLoginResponse } = useAuthManager(); // ✅ Usamos AuthManager
    const { confirmedContacts, fetchContacts } = useContactManager();

    // ✅ **Intentar agregar un contacto, autenticando si es necesario**
    const handleAddContact = useCallback(() => {
        if (!isAuthenticated) {
            console.warn("⚠️ Intento de agregar contacto sin autenticación. Activando login...");
            handleLoginResponse(); // 🔄 Activa el proceso de autenticación
            return;
        }
        console.warn("⚠️ Agregar contactos ahora está en RightPanel.jsx");
    }, [isAuthenticated, handleLoginResponse]);

    useEffect(() => {
        fetchContacts(); // ✅ Cargar contactos al inicio
    }, [fetchContacts]);

    if (!isReady) {
        return <p className="auth-warning">🔒 Cargando datos de la wallet...</p>;
    }

    return (
        <div className="contact-list-container">
            <h3>📞 Contactos</h3>

            {!walletAddress ? (
                <p className="auth-warning">⚠️ Conéctate a una wallet para gestionar contactos.</p>
            ) : confirmedContacts.length > 0 ? (
                <ul className="contact-list">
                    {confirmedContacts.map(({ wallet }) => (
                        <li key={wallet} className="contact-item" onClick={() => onSelectContact(wallet)}>
                            {wallet.slice(0, 6)}...{wallet.slice(-4)}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-contacts-message">Aún no tienes contactos.</p>
            )}

            <button 
                className="floating-add-button" 
                onClick={handleAddContact} 
                disabled={!walletAddress || isLoading}
            >
                ➕
            </button>
        </div>
    );
};

export default React.memo(ContactList);
