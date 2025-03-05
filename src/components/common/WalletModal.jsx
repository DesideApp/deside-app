import React, { useState } from "react";
import { getProvider } from "../../services/walletProviders.js";
import "./WalletModal.css";

const WalletModal = ({ isOpen, onClose, onWalletSelected }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Si `isOpen` es `false`, no renderizamos nada
  if (!isOpen) return null;

  // ✅ **Función directa sin `useCallback`**
  const handleWalletSelection = async (walletType) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { provider, error } = getProvider(walletType);
      if (!provider) throw new Error(error || "❌ No encontramos tu wallet. Asegúrate de que está instalada.");

      await provider.connect();
      if (!provider.publicKey) throw new Error("❌ No pudimos conectar con tu wallet. Verifica tu conexión.");

      const publicKey = provider.publicKey.toBase58();
      console.log("✅ Wallet seleccionada:", publicKey);

      if (typeof onWalletSelected === "function") {
        onWalletSelected(publicKey); // ✅ Solo envía la selección
      }

      onClose(); // ✅ Cerrar modal tras seleccionar

    } catch (error) {
      console.error("❌ Error conectando la wallet:", error);
      setErrorMessage(error.message);
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
