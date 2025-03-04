import React, { useState, useCallback } from "react";
import { getProvider } from "../../services/walletProviders.js";
import "./WalletModal.css";

const WalletModal = ({ isOpen, onClose, onWalletConnected }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleWalletSelection = useCallback(async (walletType) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const provider = getProvider(walletType);
      if (!provider) throw new Error("No encontramos tu wallet. Asegúrate de que está instalada y vuelve a intentarlo.");

      await provider.connect();
      if (!provider.publicKey) throw new Error("No pudimos conectar con tu wallet. Verifica tu conexión e inténtalo de nuevo.");

      const publicKey = provider.publicKey.toBase58();
      console.log("✅ Wallet conectada:", publicKey);

      onWalletConnected(publicKey);
      onClose(); // 🔴 Cerrar modal tras selección

    } catch (error) {
      console.error("❌ Error conectando la wallet:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [onWalletConnected, onClose]);

  return (
    <div className="wallet-modal-overlay" onClick={!isLoading ? onClose : null}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <h2>🔗 Connect Your Wallet</h2>

        <div className="wallet-options">
          {["phantom", "backpack", "magiceden"].map((wallet) => (
            <button 
              key={wallet} 
              onClick={() => handleWalletSelection(wallet)} 
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : `${wallet.charAt(0).toUpperCase() + wallet.slice(1)} Wallet`}
            </button>
          ))}
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button className="close-modal" onClick={!isLoading ? onClose : null} disabled={isLoading}>
          Close
        </button>
      </div>
    </div>
  );
};

export default WalletModal;
