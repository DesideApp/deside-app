import React from "react";
import { Copy } from "lucide-react";
import "./DonationModal.css";

const DONATION_WALLET = process.env.REACT_APP_DONATION_WALLET || "9X7yR...F8dZ"; // ✅ Ahora se obtiene desde `.env`

function DonationModal({ isOpen, onClose }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(DONATION_WALLET);
    alert("✅ Wallet address copied! Thank you for your support. 💜");
  };

  if (!isOpen) return null;

  return (
    <div className="donation-modal-overlay" onClick={onClose}>
      <div className="donation-modal" onClick={(e) => e.stopPropagation()}>
        <h2>💜 Support Our Project</h2>
        <p className="donation-message">
          We don't run ads or sell data. If you enjoy using DeChat, consider supporting us!
        </p>

        <div className="donation-wallet-container">
          <span>{DONATION_WALLET}</span>
          <button className="copy-button" onClick={handleCopy} aria-label="Copy Address">
            <Copy size={18} />
          </button>
        </div>

        <button className="donation-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default DonationModal;
