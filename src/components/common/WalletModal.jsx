import React from "react";
import { ensureWalletState } from "../../services/walletStateService.js";
import "./WalletModal.css";

function WalletModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleWalletSelection = async (walletType) => {
    console.log(`🔵 Intentando conectar con ${walletType}...`);

    // ✅ Ejecutar la función que garantiza el estado de la wallet
    const { state } = await ensureWalletState();

    // ✅ Revisar directamente el estado sin necesidad de importar STATES
    if (state === "AUTENTICADO Y SI") {
      console.log("✅ Wallet conectada y autenticada.");
      onClose(); // 🔥 Cerramos el modal solo si la autenticación fue exitosa.
    } else {
      console.warn("⚠️ No se pudo conectar o autenticar la wallet.");
    }
  };

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <h2>🔗 Connect Your Wallet</h2>
        <p>Select a wallet to connect:</p>
        <div className="wallet-options">
          <button onClick={() => handleWalletSelection("phantom")}>Phantom Wallet</button>
          <button onClick={() => handleWalletSelection("backpack")}>Backpack Wallet</button>
          <button onClick={() => handleWalletSelection("magiceden")}>Magic Eden Wallet</button>
        </div>
        <button className="close-modal" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default WalletModal;
