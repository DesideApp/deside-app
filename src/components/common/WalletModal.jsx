import React, { useState } from "react";
import "./WalletModal.css";

const WalletModal = ({ isOpen, onClose, onWalletSelected }) => {
  const [isLoading, setIsLoading] = useState(false);

  // ✅ **Manejamos la selección sin bloqueos innecesarios**
  const handleWalletSelection = async (walletType) => {
    if (isLoading) return; // ✅ Evita selección doble mientras carga

    console.log(`🟢 Abriendo proveedor de ${walletType}...`);
    setIsLoading(true);

    try {
      if (onWalletSelected) {
        await onWalletSelected(walletType);
      }
    } catch (error) {
      console.error("❌ Error abriendo la wallet:", error);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wallet-modal-overlay" onClick={!isLoading ? onClose : null}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <h2>🔗 Select Your Wallet</h2>

        <div className="wallet-options">
          {["phantom", "backpack", "magiceden"].map((wallet) => (
            <button key={wallet} onClick={() => handleWalletSelection(wallet)} disabled={isLoading}>
              {isLoading ? "Opening..." : `${wallet.charAt(0).toUpperCase()}${wallet.slice(1)} Wallet`}
            </button>
          ))}
        </div>

        <button className="close-modal" onClick={!isLoading ? onClose : null} disabled={isLoading}>
          Close
        </button>
      </div>
    </div>
  );
};

export default WalletModal;
