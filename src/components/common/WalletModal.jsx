import React, { useState } from "react";
import { useWallet } from "../../contexts/WalletContext"; // ✅ Importar el contexto
import { ensureWalletState } from "../../services/walletStateService.js";
import { getProvider } from "../../services/walletProviders.js"; // ✅ Importar los providers
import "./WalletModal.css";

function WalletModal({ isOpen, onClose }) {
  const { walletStatus, isReady } = useWallet(); // ✅ Obtener estado desde el contexto global
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Evitar mostrar el modal si el contexto aún no está listo
  if (!isOpen || !isReady) return null;

  const handleWalletSelection = async (walletType) => {
    console.log(`🔵 Intentando conectar con ${walletType}...`);

    setIsLoading(true);

    // ✅ Verificar si la wallet ya está autenticada
    if (walletStatus === "authenticated") {
      console.log("✅ Wallet ya autenticada.");
      setIsLoading(false);
      onClose();
      return;
    }

    // ✅ Obtener el provider correcto
    const provider = getProvider(walletType);
    if (!provider) {
      console.error("❌ Provider no encontrado para", walletType);
      setIsLoading(false);
      return;
    }

    try {
      await provider.connect();
      const { state } = await ensureWalletState();

      if (state === "AUTENTICADO Y SI") {
        console.log("✅ Wallet conectada y autenticada.");
        onClose();
      } else {
        console.warn("⚠️ No se pudo conectar o autenticar la wallet.");
      }
    } catch (error) {
      console.error("❌ Error al conectar la wallet:", error);
    }

    setIsLoading(false);
  };

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <h2>🔗 Connect Your Wallet</h2>
        <p>Select a wallet to connect:</p>

        <div className="wallet-options">
          <button onClick={() => handleWalletSelection("phantom")} disabled={isLoading}>
            {isLoading ? "Connecting..." : "Phantom Wallet"}
          </button>
          <button onClick={() => handleWalletSelection("backpack")} disabled={isLoading}>
            {isLoading ? "Connecting..." : "Backpack Wallet"}
          </button>
          <button onClick={() => handleWalletSelection("magiceden")} disabled={isLoading}>
            {isLoading ? "Connecting..." : "Magic Eden Wallet"}
          </button>
        </div>

        <button className="close-modal" onClick={onClose} disabled={isLoading}>
          Close
        </button>
      </div>
    </div>
  );
}

export default WalletModal;
