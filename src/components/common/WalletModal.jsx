import React, { useState } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { authenticateWallet } from "../../services/walletService.js"; // ✅ Se usa autenticación correcta
import { getProvider } from "../../services/walletProviders.js";
import "./WalletModal.css";

function WalletModal({ isOpen, onClose }) {
  const { isReady } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen || !isReady) return null;

  const handleWalletSelection = async (walletType) => {
    console.log(`🔵 Intentando conectar con ${walletType}...`);
    setIsLoading(true);
    setErrorMessage("");

    const provider = getProvider(walletType);
    if (!provider) {
      console.error("❌ Provider no encontrado para", walletType);
      setErrorMessage("❌ Wallet provider not found.");
      setIsLoading(false);
      return;
    }

    try {
      await provider.connect();

      if (!provider.publicKey) {
        throw new Error("❌ No se pudo obtener la clave pública de la wallet.");
      }

      console.log("🔄 Autenticando wallet en el backend...");
      const authResult = await authenticateWallet(walletType);

      if (authResult.status === "authenticated") {
        console.log("✅ Wallet conectada y autenticada.");
        onClose();
      } else {
        console.warn("⚠️ No se pudo autenticar la wallet.");
        setErrorMessage("⚠️ Authentication failed. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error al conectar la wallet:", error);
      setErrorMessage("❌ Connection error. Please retry.");
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

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button className="close-modal" onClick={onClose} disabled={isLoading}>
          Close
        </button>
      </div>
    </div>
  );
}

export default WalletModal;
