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
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div
        className="wallet-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="donation-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="wallet-modal-header">
          <div id="donation-title">Support Deside ❤️</div>
        </div>

        {/* Body */}
        <div className="wallet-modal-body">
          <div className="wallet-info-box">
            <span className="wallet-info-title">Donation Address</span>
            <div className="wallet-info-value">
              <span className="wallet-address">{DONATION_WALLET}</span>
              <div className="wallet-info-actions">
                <button className="copy-button" onClick={handleCopy} aria-label="Copy wallet address">
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
            <p className="copy-success" aria-live="polite">
              ✅ Address copied. Thank you! ❤️
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="wallet-modal-footer">
          <div className="close-modal" onClick={onClose}>
            CLOSE
          </div>
        </div>
      </div>
    </div>
  );
});

export default DonationModal;
