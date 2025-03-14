import React, { useEffect, useCallback, useState, memo } from "react";
import { FaUserFriends, FaUserPlus } from "react-icons/fa"; // 📌 Iconos para pestañas
import useContactManager from "../../hooks/useContactManager";
import { useAuthManager } from "../../services/authManager";
import "./LeftPanel.css";

const LeftPanel = ({ onSelectContact }) => {
    const { isAuthenticated, selectedWallet, handleLoginResponse } = useAuthManager();
    const { confirmedContacts, fetchContacts } = useContactManager();
    const [activeTab, setActiveTab] = useState("contacts");

    // ✅ **Carga de contactos cuando el usuario está autenticado y tiene una wallet conectada**
    useEffect(() => {
        if (isAuthenticated && selectedWallet) fetchContacts();
    }, [fetchContacts, isAuthenticated, selectedWallet]);

    // ✅ **Manejo de autenticación al hacer clic**
    const handlePanelClick = useCallback(() => {
        if (!isAuthenticated) {
            console.warn("⚠️ Usuario no autenticado. Activando login...");
            handleLoginResponse(() => fetchContacts());
        }
    }, [isAuthenticated, handleLoginResponse, fetchContacts]);

    return (
        <>
            {/* ✅ Header estructural vacío pero con espacio fijo */}
            <header className="left-panel-header"></header>

            {/* 📌 Contenedor del contenido con efecto hundido */}
            <div className="left-panel-content" onClick={handlePanelClick}>
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

            {/* 📌 Menú de pestañas con iconos */}
            <nav className="left-panel-nav">
                <button
                    className={activeTab === "contacts" ? "active" : ""}
                    onClick={() => setActiveTab("contacts")}
                    aria-label="Lista de contactos"
                >
                    <FaUserFriends size={18} />
                </button>
                <button
                    className={activeTab === "add" ? "active" : ""}
                    onClick={() => setActiveTab("add")}
                    aria-label="Agregar contacto"
                >
                    <FaUserPlus size={18} />
                </button>
            </nav>
        </>
    );
};

export default memo(LeftPanel);
