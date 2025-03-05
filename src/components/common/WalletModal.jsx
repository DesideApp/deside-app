import React, { useState } from "react";
import "./WalletModal.css";

const WalletModal = ({ isOpen, onClose, onWalletSelected }) => {
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Si `isOpen` es `false`, no renderizamos nada
  if (!isOpen) return null;

  // ✅ **Función que solo abre el proveedor de la wallet**
  const handleWalletSelection = (walletType) => {
    setIsLoading(true);

    try {
      console.log(`🟢 Abriendo proveedor de ${walletType}...`);

      if (typeof onWalletSelected === "function") {
        onWalletSelected(walletType); // ✅ Solo envía el tipo de wallet seleccionada
      }

      onClose(); // ✅ Cerrar modal inmediatamente después de la selección
    } catch (error) {
      console.error("❌ Error abriendo la wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wallet-modal-overlay" onClick={!isLoading ? onClose : null}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <h2>🔗 Select Your Wallet</h2>

        <div className="wallet-options">
          {["phantom", "backpack", "magiceden"].map((wallet) => (
            <button 
              key={wallet} 
              onClick={() => handleWalletSelection(wallet)} 
              disabled={isLoading}
            >
              {isLoading ? "Opening..." : `${wallet.charAt(0).toUpperCase() + wallet.slice(1)} Wallet`}
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
