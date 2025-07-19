import React, { useState, memo } from "react";
import { Users, MessageCircle, UserPlus, Bell } from "lucide-react";
import useContactManager from "../../hooks/useContactManager";
import useConversationManager from "../../hooks/useConversationManager";
import useBackupManager from "../../hooks/useBackupManager";
import NotificationPanel from "../chatcomps/NotificationPanel";
import AddContactForm from "../chatcomps/AddContactForm";
import ContactList from "../chatcomps/ContactList";
import ConversationList from "../chatcomps/ConversationList";
import ConverList from "../conversation/ConverList";
import "./LeftPanel.css";

const LeftPanel = ({ onSelectContact }) => {
  const {
    confirmedContacts,
    receivedRequests,
    handleAddContact,
    handleAcceptRequest,
    handleRejectRequest,
    loading: contactsLoading,
  } = useContactManager();

  const {
    conversations,
    loading: conversationsLoading,
    refresh,
  } = useConversationManager();

  const { backupData } = useBackupManager();

  const pubkey = backupData?.pubkey;
  const encryptionKey = backupData?.encryptionKey;
  const localPreviews = backupData?.metadata?.recentConversations || [];

  const [activeTab, setActiveTab] = useState("chats");
  const [selectedContactWallet, setSelectedContactWallet] = useState(null);
  const [selectedConversationPubkey, setSelectedConversationPubkey] = useState(null);

  const isLoading = conversationsLoading || contactsLoading;

  const handleConversationSelect = (pubkey) => {
    setSelectedConversationPubkey(pubkey);
    setSelectedContactWallet(null);
    onSelectContact?.(pubkey);
  };

  const handleContactSelect = (wallet) => {
    setSelectedContactWallet(wallet);
    setSelectedConversationPubkey(null);
    onSelectContact?.(wallet);
  };

  const tabTitles = {
    chats: "CHAT",
    contacts: "CONTACTS",
    addContact: "Add Contact",
    requests: "Notifications",
  };

  return (
    <div className="left-panel">
      {/* HEADER */}
      <header className="left-panel-header">
        <h2 className="left-panel-title">{tabTitles[activeTab]}</h2>
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
            aria-label="Add Contact"
          >
            <UserPlus size={20} />
          </button>
          <button
            className={activeTab === "requests" ? "active" : ""}
            onClick={() => setActiveTab("requests")}
            aria-label="Notifications"
          >
            <div className="icon-wrapper">
              <Bell size={20} />
              {receivedRequests.length > 0 && (
                <span className="badge">{receivedRequests.length}</span>
              )}
            </div>
          </button>
        </nav>
      </header>

      {/* BODY */}
      <div className="left-panel-body">
        {isLoading && <p className="left-panel-loading">Loading...</p>}

        {!isLoading && activeTab === "chats" && (
          <>
            {conversations.length > 0 ? (
              <ConversationList
                conversations={conversations}
                onConversationSelected={handleConversationSelect}
                onRefresh={refresh}
                selectedPubkey={selectedConversationPubkey}
              />
            ) : (
              <>
                <p className="no-data-text">
                  No conversations from backend. Loading local previews...
                </p>
                <ConverList
                  pubkey={pubkey}
                  encryptionKey={encryptionKey}
                  onSelect={handleConversationSelect}
                />
              </>
            )}
          </>
        )}

        {!isLoading && activeTab === "contacts" && (
          <>
            {confirmedContacts.length > 0 || localPreviews.length > 0 ? (
              <ContactList
                confirmedContacts={confirmedContacts}
                previews={localPreviews}
                onContactSelected={handleContactSelect}
                selectedWallet={selectedContactWallet}
              />
            ) : (
              <p className="no-data-text">No contacts yet. Add new friends!</p>
            )}
          </>
        )}

        {!isLoading && activeTab === "addContact" && (
          <AddContactForm onAddContact={handleAddContact} />
        )}

        {!isLoading && activeTab === "requests" && (
          <NotificationPanel
            receivedRequests={receivedRequests}
            onAcceptRequest={handleAcceptRequest}
            onRejectRequest={handleRejectRequest}
          />
        )}
      </div>
    </div>
  );
};

export default memo(LeftPanel);
