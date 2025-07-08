import React, { useState, memo } from "react";
import { Users, MessageCircle, UserPlus, Bell } from "lucide-react";
import useContactManager from "../../hooks/useContactManager";
import NotificationPanel from "../chatcomps/NotificationPanel";
import AddContactForm from "../chatcomps/AddContactForm";
import ContactList from "../chatcomps/ContactList";
import ConversationList from "../chatcomps/ConversationList";
import "./LeftPanel.css";

const LeftPanel = ({ onSelectContact }) => {
  const { confirmedContacts } = useContactManager();
  const [activeTab, setActiveTab] = useState("chats");

  // 🔹 Diccionario de títulos por pestaña
  const tabTitles = {
    chats: "Chats",
    contacts: "Contacts",
    addContact: "Add Contact",
    requests: "Notifications",
  };

  // ✅ Simulamos conversaciones (esto en el futuro vendrá de la API / backups)
  const conversations = [
    {
      pubkey: "ABCDEFG1234567890",
      nickname: "Satoshi",
      lastMessage: "Hey, how are you?",
      timestamp: new Date().toISOString(),
      avatar: null,
    },
    {
      pubkey: "HIJKLMN9876543210",
      nickname: null,
      lastMessage: "Let's meet at 5pm.",
      timestamp: new Date().toISOString(),
      avatar: null,
    },
  ];

  return (
    <>
      {/* ✅ Título dinámico según pestaña activa */}
      <header className="left-panel-header">
        <h2 className="left-panel-title">{tabTitles[activeTab]}</h2>
      </header>

      <div className="left-panel-content">
        {activeTab === "chats" && (
          <ConversationList
            conversations={conversations}
            onConversationSelected={onSelectContact}
          />
        )}

        {activeTab === "contacts" && (
          <ContactList
            confirmedContacts={confirmedContacts}
            onContactSelected={onSelectContact}
          />
        )}

        {activeTab === "addContact" && <AddContactForm />}
        {activeTab === "requests" && <NotificationPanel />}
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
