import React, { useState, memo } from "react";
import { Users, MessageCircle, UserPlus, Bell } from "lucide-react";
import useContactManager from "../../hooks/useContactManager";
import ContactRequests from "../chatcomps/ContactRequests";
import AddContactForm from "../chatcomps/AddContactForm";
import "./LeftPanel.css";

const LeftPanel = () => {
  const { confirmedContacts } = useContactManager();
  const [activeTab, setActiveTab] = useState("chats");

  // 🔹 Diccionario de títulos por pestaña
  const tabTitles = {
    chats: "Chats",
    contacts: "Contacts",
    addContact: "Add Contact",
    requests: "Notifications",
  };

  return (
    <>
      {/* ✅ Título dinámico según pestaña activa */}
      <header className="left-panel-header">
        <h2 className="left-panel-title">{tabTitles[activeTab]}</h2>
      </header>

      <div className="left-panel-content">
        {activeTab === "contacts" && (
          <ul className="contact-list">
            {confirmedContacts.map(({ wallet }) => (
              <li key={wallet} className="contact-item">
                {wallet.slice(0, 6)}...{wallet.slice(-4)}
              </li>
            ))}
          </ul>
        )}

        {activeTab === "addContact" && <AddContactForm />}
        {activeTab === "requests" && <ContactRequests />}

        {/* ⚠️ NOTA: 'chats' aún no tiene componente asociado */}
      </div>

      <nav className="left-panel-nav">
        <button
          className={activeTab === "chats" ? "active" : ""}
          onClick={() => setActiveTab("chats")}
          aria-label="Chats"
        >
          <MessageCircle size={20} />
        </button>
        <button
          className={activeTab === "contacts" ? "active" : ""}
          onClick={() => setActiveTab("contacts")}
          aria-label="Contacts"
        >
          <Users size={20} />
        </button>
        <button
          className={activeTab === "addContact" ? "active" : ""}
          onClick={() => setActiveTab("addContact")}
          aria-label="Add contact"
        >
          <UserPlus size={20} />
        </button>
        <button
          className={activeTab === "requests" ? "active" : ""}
          onClick={() => setActiveTab("requests")}
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>
      </nav>
    </>
  );
};

export default memo(LeftPanel);
