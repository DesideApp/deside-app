import React, { useState } from "react";
import { connectWallet } from "../../services/walletService"; // ✅ Usa la función correcta
import "./WalletModal.css";

const WalletModal = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 🔹 **Manejar selección de wallet**
   * @param {string} wallet - Nombre del proveedor de wallet seleccionado
   */
  const handleWalletSelection = async (wallet) => {
    if (isLoading) return; // ✅ Evita llamadas repetidas
    setIsLoading(true);
    onClose(); // ✅ Cierra el modal inmediatamente

    try {
      await connectWallet(wallet); // ✅ Conexión a través de walletService.js
    } catch (error) {
      console.error(`❌ Error conectando con ${wallet}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wallet-modal-overlay" onClick={!isLoading ? onClose : null} aria-hidden="true">
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="wallet-modal-title">
        <h2 id="wallet-modal-title">🔗 Select Your Wallet</h2>

        <div className="wallet-options">
          {["phantom", "backpack", "magiceden"].map((wallet) => (
            <button 
              key={wallet} 
              onClick={() => handleWalletSelection(wallet)} 
              disabled={isLoading} 
              aria-label={`Connect to ${wallet}`}>
              {isLoading ? "Connecting..." : `${wallet.charAt(0).toUpperCase()}${wallet.slice(1)} Wallet`}
            </button>
          ))}
        </div>

        <button className="close-modal" onClick={!isLoading ? onClose : null} disabled={isLoading} aria-label="Close Wallet Modal">
          Close
        </button>
      </div>
    </div>
  );
};

export default WalletModal;
