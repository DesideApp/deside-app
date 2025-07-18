import React, { useCallback, useState, memo } from "react";
import { Copy, Check } from "lucide-react";
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
      <div
        className="donation-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="donation-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="donation-modal-header">
          <div id="donation-title">Support Deside </div>
        </div>

        {/* Body */}
        <div className="donation-modal-body">
          <div className="donation-info-box">
            <span className="donation-info-title">Donation Address</span>
            <div className="donation-info-value">
              <span className="donation-wallet-address">{DONATION_WALLET}</span>
              <div className="donation-info-actions">
                <button
                  className="donation-copy-button"
                  onClick={handleCopy}
                  aria-label="Copy wallet address"
                >
                  {copySuccess ? (
                    <Check size={18} color="#28a745" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {copySuccess && (
            <p className="donation-copy-success" aria-live="polite">
              ✅ Address copied. Thank you! ❤️
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="donation-modal-footer">
          <div className="donation-close-modal" onClick={onClose}>
            CLOSE
          </div>
        </div>
      </div>
    </div>
  );
});

export default DonationModal;
