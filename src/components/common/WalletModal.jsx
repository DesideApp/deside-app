import React, { useState, useCallback } from "react";
import { getProvider } from "../../services/walletProviders.js";
import "./WalletModal.css";

const WalletModal = ({ isOpen, onClose, onWalletConnected }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleWalletSelection = useCallback(async (walletType) => {
    console.log(`🔵 Intentando conectar con ${walletType}...`);
    setIsLoading(true);
    setErrorMessage("");

    try {
      const provider = getProvider(walletType);
      if (!provider) throw new Error("Wallet provider not found.");

      await provider.connect();
      if (!provider.publicKey) throw new Error("No se pudo obtener la clave pública.");

      console.log("✅ Wallet conectada:", provider.publicKey.toBase58());
      
      // ✅ Llamamos a la función que nos pasó el padre (WalletButton)
      onWalletConnected(provider.publicKey.toBase58());

      onClose(); // 🔴 El modal se cierra
    } catch (error) {
      console.error("❌ Error conectando la wallet:", error);
      setErrorMessage(error.message || "❌ Connection error. Please retry.");
    } finally {
      setIsLoading(false);
    }
  }, [onWalletConnected, onClose]);

  return (
    <div className="wallet-modal-overlay" onClick={isLoading ? null : onClose}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <h2>🔗 Connect Your Wallet</h2>
        <p>Select a wallet to connect:</p>

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

        {errorMessage && <p className="error-message" aria-live="assertive">{errorMessage}</p>}

        <button className="close-modal" onClick={isLoading ? null : onClose} disabled={isLoading}>
          Close
        </button>
      </div>
    </div>
  );
};

export default WalletModal;
