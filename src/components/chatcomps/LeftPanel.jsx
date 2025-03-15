import React, { useEffect, useCallback, useState, memo } from "react";
import { FaUserFriends, FaUserPlus } from "react-icons/fa"; // 📌 Iconos de contactos
import { MdOutlineMail, MdMail, MdPersonOutline, MdPerson } from "react-icons/md"; // 📌 Iconos de solicitudes y agregar
import useContactManager from "../../hooks/useContactManager";
import { useAuthManager } from "../../services/authManager";
import ContactRequests from "../chatcomps/ContactRequests";
import AddContactForm from "../chatcomps/AddContactForm";
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
                ) : activeTab === "requests" ? (
                    <ContactRequests />
                ) : activeTab === "addContact" ? (
                    <AddContactForm />
                ) : (
                    <p className="add-contact-placeholder">➕ Add Contact (Functionality Soon)</p>
                )}
            </div>

            {/* 📌 Menú de pestañas con 4 iconos */}
            <nav className="left-panel-nav">
                <button
                    className={activeTab === "contacts" ? "active" : ""}
                    onClick={() => setActiveTab("contacts")}
                    aria-label="Lista de contactos"
                >
                    <FaUserFriends size={18} />
                </button>
                <button
                    className={activeTab === "requests" ? "active" : ""}
                    onClick={() => setActiveTab("requests")}
                    aria-label="Solicitudes de contacto"
                >
                    {activeTab === "requests" ? <MdMail size={18} /> : <MdOutlineMail size={18} />}
                </button>
                <button
                    className={activeTab === "addContact" ? "active" : ""}
                    onClick={() => setActiveTab("addContact")}
                    aria-label="Agregar contacto"
                >
                    {activeTab === "addContact" ? <MdPerson size={18} /> : <MdPersonOutline size={18} />}
                </button>
                <button
                    className={activeTab === "add" ? "active" : ""}
                    onClick={() => setActiveTab("add")}
                    aria-label="Añadir manualmente"
                >
                    <FaUserPlus size={18} />
                </button>
            </nav>
        </>
    );
};

export default memo(LeftPanel);
