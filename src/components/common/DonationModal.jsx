import React, { useCallback, useState, memo } from "react";
import { Copy } from "lucide-react";
import "./DonationModal.css";

const DONATION_WALLET = import.meta.env.VITE_DONATION_WALLET || "9X7yR...F8dZ";

const DonationModal = memo(({ isOpen, onClose }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!DONATION_WALLET) return;
    
    try {
      await navigator.clipboard.writeText(DONATION_WALLET);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      console.error("❌ Error al copiar la dirección:", error);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="donation-modal-overlay" onClick={onClose}>
      <div className="donation-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="donation-title">
        <h2 id="donation-title">💜 Support Our Project</h2>
        <p className="donation-message">
          We don't run ads or sell data. If you enjoy using DeChat, consider supporting us!
        </p>

        <div className="donation-wallet-container">
          <span>{DONATION_WALLET}</span>
          <button className="copy-button" onClick={handleCopy} aria-label="Copy Wallet Address">
            <Copy size={18} />
          </button>
        </div>

        {copySuccess && (
          <p className="copy-success" aria-live="polite">
            ✅ Wallet address copied! Thank you! 💜
          </p>
        )}

        <button className="donation-close-button" onClick={onClose} aria-label="Close Donation Modal">
          Close
        </button>
      </div>
    </div>
  );
});

export default DonationModal;
