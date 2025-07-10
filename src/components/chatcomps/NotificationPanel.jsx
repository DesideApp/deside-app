import React, { memo } from "react";
import ContactRequests from "./ContactRequests";
import { Users, MessageCircle, UserPlus, Bell } from "lucide-react";
import "./NotificationPanel.css";


const NotificationPanel = ({
  receivedRequests = [],
  onAcceptRequest,
  onRejectRequest,
  onClose
}) => {
  return (
    <div className="notification-panel-container">
      <div className="notification-header">
        <h2 className="notification-title">Notifications</h2>
        <button onClick={onClose} aria-label="Close Notifications">
          ✖
        </button>
      </div>

      <section className="notifications-section">
        <ContactRequests
          receivedRequests={receivedRequests}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
        />
      </section>

      {/* 🔥 FUTURO:
          <section className="notifications-section">
            <OtherNotifications />
          </section>
      */}
    </div>
  );
};

const notificationCount = receivedRequests.length;

<nav className="left-panel-nav">
  <button
    className={activeTab === "chats" ? "active" : ""}
    onClick={() => setActiveTab("chats")}
    aria-label="Chats"
  >
    <div className="icon-wrapper">
      <MessageCircle size={20} />
      {/* Aquí podrías meter badge de unreadMessages más adelante */}
    </div>
  </button>
  <button
    className={activeTab === "contacts" ? "active" : ""}
    onClick={() => setActiveTab("contacts")}
    aria-label="Contacts"
  >
    <div className="icon-wrapper">
      <Users size={20} />
    </div>
  </button>
  <button
    className={activeTab === "addContact" ? "active" : ""}
    onClick={() => setActiveTab("addContact")}
    aria-label="Add Contact"
  >
    <div className="icon-wrapper">
      <UserPlus size={20} />
    </div>
  </button>
  <button
    className={activeTab === "requests" ? "active" : ""}
    onClick={() => setActiveTab("requests")}
    aria-label="Notifications"
  >
    <div className="icon-wrapper">
      <Bell size={20} />
      {notificationCount > 0 && (
        <span className="badge">{notificationCount}</span>
      )}
    </div>
  </button>
</nav>

export default memo(NotificationPanel);
