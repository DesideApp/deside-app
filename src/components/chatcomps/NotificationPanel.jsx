import React, { memo } from "react";
import ContactRequests from "./ContactRequests";
import "./NotificationPanel.css";

const NotificationPanel = ({
  receivedRequests = [],
  onAcceptRequest,
  onRejectRequest,
  onClose,
}) => {
  return (
    <div className="notification-panel-container">
      <div className="notification-header">
        <h2 className="notification-title">Notifications</h2>
        <button
          onClick={onClose}
          aria-label="Close Notifications"
          className="notification-close-btn"
        >
          ✖
        </button>
      </div>

      <section className="notifications-section">
        {receivedRequests.length > 0 ? (
          <ContactRequests
            receivedRequests={receivedRequests}
            onAcceptRequest={onAcceptRequest}
            onRejectRequest={onRejectRequest}
          />
        ) : (
          <p className="no-requests-text text-gray-500">
            No contact requests at the moment.
          </p>
        )}
      </section>

      {/* 🔥 FUTURO:
          <section className="notifications-section">
            <OtherNotifications />
          </section>
      */}
    </div>
  );
};

export default memo(NotificationPanel);
