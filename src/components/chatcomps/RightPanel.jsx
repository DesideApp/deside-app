import React, { useState, memo } from "react";
import { Users, MessageCircle, UserPlus, Bell } from "lucide-react";
import useContactManager from "../../hooks/useContactManager";
import NotificationPanel from "../chatcomps/NotificationPanel";
import AddContactForm from "../chatcomps/AddContactForm";
import ContactList from "../chatcomps/ContactList";
import ConversationList from "../chatcomps/ConversationList";
import "./RightPanel.css";

const RightPanel = ({ onSelectContact }) => {
  const { confirmedContacts } = useContactManager();
  const [activeTab, setActiveTab] = useState("chats");

  const tabTitles = {
    chats: "Chats",
    contacts: "Contacts",
    addContact: "Add Contact",
    requests: "Notifications",
  };

  const conversations = [
    {
      pubkey: "XYZ123456789",
      nickname: "Vitalik",
      lastMessage: "See you soon!",
      timestamp: new Date().toISOString(),
      avatar: null,
    },
    {
      pubkey: "LMNOP987654321",
      nickname: "Anatoly",
      lastMessage: "Let's build it.",
      timestamp: new Date().toISOString(),
      avatar: null,
    },
  ];

  return (
    <>
      <header className="right-panel-header">
        <h2 className="right-panel-title">{tabTitles[activeTab]}</h2>
      </header>

      <div className="right-panel-content">
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

      <nav className="right-panel-nav">
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

export default memo(RightPanel);
