import React, { useEffect, useCallback, useState, memo } from "react";
import { Users, MessageCircle, UserPlus, Inbox } from "lucide-react";
import useContactManager from "../../hooks/useContactManager";
import { useAuthManager } from "../../services/authManager";
import ContactRequests from "../chatcomps/ContactRequests";
import AddContactForm from "../chatcomps/AddContactForm";
import "./LeftPanel.css";

const LeftPanel = () => {
  const { isAuthenticated, selectedWallet, handleLoginResponse } = useAuthManager();
  const { confirmedContacts, fetchContacts } = useContactManager();
  const [activeTab, setActiveTab] = useState("contacts");

  // ✅ Carga de contactos si autenticado y con wallet
  useEffect(() => {
    if (isAuthenticated && selectedWallet) fetchContacts();
  }, [fetchContacts, isAuthenticated, selectedWallet]);

  // ✅ Login al hacer clic si no autenticado
  const handlePanelClick = useCallback(() => {
    if (!isAuthenticated) {
      console.warn("⚠️ Usuario no autenticado. Activando login...");
      handleLoginResponse(() => fetchContacts());
    }
  }, [isAuthenticated, handleLoginResponse, fetchContacts]);

  return (
    <>
      <header className="left-panel-header"></header>

      <div className="left-panel-content" onClick={handlePanelClick}>
        {activeTab === "contacts" ? (
          !selectedWallet ? (
            <p className="auth-warning">⚠️ Connect your wallet to see contacts.</p>
          ) : confirmedContacts.length > 0 ? (
            <ul className="contact-list">
              {confirmedContacts.map(({ wallet }) => (
                <li key={wallet} className="contact-item">
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

      <nav className="left-panel-nav">
        <button
          className={activeTab === "contacts" ? "active" : ""}
          onClick={() => setActiveTab("contacts")}
          aria-label="Lista de contactos"
        >
          <Users size={20} />
        </button>
        <button
          className={activeTab === "requests" ? "active" : ""}
          onClick={() => setActiveTab("requests")}
          aria-label="Solicitudes de contacto"
        >
          <Inbox size={20} />
        </button>
        <button
          className={activeTab === "addContact" ? "active" : ""}
          onClick={() => setActiveTab("addContact")}
          aria-label="Agregar contacto"
        >
          <UserPlus size={20} />
        </button>
        <button
          className={activeTab === "chats" ? "active" : ""}
          onClick={() => setActiveTab("chats")}
          aria-label="Conversaciones"
        >
          <MessageCircle size={20} />
        </button>
      </nav>
    </>
  );
};

export default memo(LeftPanel);
