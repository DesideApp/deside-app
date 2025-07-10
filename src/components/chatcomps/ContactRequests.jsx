import React, { memo } from "react";
import useContactManager from "../../hooks/useContactManager.js";
import { notify } from "../../services/notificationService.js";

const ContactRequests = ({ onContactAdded }) => {
  const {
    receivedRequests,
    handleAcceptRequest,
    handleRejectRequest,
  } = useContactManager();

  const handleAction = async (pubkey, action) => {
    try {
      if (action === "approve") {
        await handleAcceptRequest(pubkey);
        notify("✅ Contact request accepted.", "success");
        if (onContactAdded) onContactAdded();
      } else {
        await handleRejectRequest(pubkey);
        notify("✅ Contact request rejected.", "success");
      }
    } catch (error) {
      console.error(`❌ Error al ${action} contacto:`, error);
      notify(`❌ Could not ${action} the contact request.`, "error");
    }
  };

  return (
    <div className="contact-requests-container">
      <h3>📥 Incoming Requests</h3>
      {receivedRequests.length > 0 ? (
        <ul className="requests-list">
          {receivedRequests.map(({ wallet, nickname }) => (
            <li key={wallet}>
              {nickname
                ? `${nickname} (${wallet.slice(0, 6)}...${wallet.slice(-4)})`
                : `${wallet.slice(0, 6)}...${wallet.slice(-4)}`}
              <button onClick={() => handleAction(wallet, "approve")}>
                ✅
              </button>
              <button onClick={() => handleAction(wallet, "reject")}>
                ❌
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-requests">No incoming requests.</p>
      )}
    </div>
  );
};

export default memo(ContactRequests);
