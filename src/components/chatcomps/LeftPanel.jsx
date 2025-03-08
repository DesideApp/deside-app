import React, { useEffect, useCallback, useState } from "react";
import { FaUserFriends, FaUserPlus } from "react-icons/fa"; // 📌 Iconos para pestañas
import useContactManager from "../../hooks/useContactManager";
import { useAuthManager } from "../../services/authManager";
import "./LeftPanel.css";

const LeftPanel = ({ onSelectContact }) => {
    const { isAuthenticated, selectedWallet, isLoading, handleLoginResponse } = useAuthManager();
    const { confirmedContacts, fetchContacts } = useContactManager();
    const [activeTab, setActiveTab] = useState("contacts"); // ✅ Estado para pestañas

    // ✅ **Carga de contactos cuando el usuario está autenticado y tiene una wallet conectada**
    useEffect(() => {
        if (isAuthenticated && selectedWallet) fetchContacts();
    }, [fetchContacts, isAuthenticated, selectedWallet]);

    // ✅ **Manejo de clics para forzar autenticación si es necesario**
    const handleClick = useCallback(() => {
        if (!isAuthenticated) {
            console.warn("⚠️ Intento de interactuar sin login. Activando login...");
            handleLoginResponse(() => fetchContacts());
        }
    }, [isAuthenticated, handleLoginResponse, fetchContacts]);

    return (
        <>
            {/* ✅ Contenido dinámico basado en la pestaña activa */}
            <div className="left-panel-content">
                {activeTab === "contacts" ? (
                    !selectedWallet ? (
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
                    )
                ) : (
                    <p className="add-contact-placeholder">➕ Add Contact (Functionality Soon)</p>
                )}
            </div>

            {/* ✅ Pestañas en la parte inferior */}
            <nav className="left-panel-nav">
                <button 
                    className={activeTab === "contacts" ? "active" : ""} 
                    onClick={() => setActiveTab("contacts")}
                >
                    <FaUserFriends size={18} />
                </button>
                <button 
                    className={activeTab === "add" ? "active" : ""} 
                    onClick={() => setActiveTab("add")}
                >
                    <FaUserPlus size={18} />
                </button>
            </nav>
        </>
    );
};

export default React.memo(LeftPanel);
