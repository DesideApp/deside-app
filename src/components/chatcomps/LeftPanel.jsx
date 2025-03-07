import React, { useEffect } from "react";
import useContactManager from "../../hooks/useContactManager";
import { useAuthManager } from "../../services/authManager"; 
import "./LeftPanel.css";

const LeftPanel = ({ onSelectContact }) => {
    const { isAuthenticated, selectedWallet, isLoading, handleLoginResponse } = useAuthManager();
    const { confirmedContacts, fetchContacts } = useContactManager();

    // ✅ **Carga de contactos solo si el usuario está autenticado**
    useEffect(() => {
        if (isAuthenticated) fetchContacts();
    }, [fetchContacts, isAuthenticated]);

    return (
        <>
            <header className="contact-list-header">
                <h3>📞 Contacts</h3>
            </header>

            <div className="contact-list-content">
                {!selectedWallet ? (
                    <p className="auth-warning">⚠️ Connect your wallet to see contacts.</p>
                ) : confirmedContacts.length > 0 ? (
                    <ul className="contact-list">
                        {confirmedContacts.map(({ wallet }) => (
                            <li 
                                key={wallet} 
                                className="contact-item" 
                                onClick={() => onSelectContact && onSelectContact(wallet)}
                            >
                                {wallet.slice(0, 6)}...{wallet.slice(-4)}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-contacts-message">No contacts yet.</p>
                )}
            </div>
        </>
    );
};

export default React.memo(LeftPanel);
