import React, { useState } from "react";
import { getProvider } from "../../services/walletProviders"; // ✅ Acceder directamente al proveedor
import "./WalletModal.css";

const WalletModal = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleWalletSelection = async (wallet) => {
    if (isLoading) return;
    setIsLoading(true);

    const provider = getProvider(wallet);
    if (!provider) {
      console.error(`❌ Proveedor de ${wallet} no encontrado.`);
      setIsLoading(false);
      return;
    }

    try {
      await provider.connect();
      window.dispatchEvent(new CustomEvent("walletConnected", { detail: { wallet, pubkey: provider.publicKey?.toBase58() } }));
    } catch (error) {
      console.error(`❌ Error conectando con ${wallet}:`, error);
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
