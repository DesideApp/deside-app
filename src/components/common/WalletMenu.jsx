import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { Copy } from "lucide-react";
import { getWalletBalance } from "../../utils/solanaDirect.js";
import DonationModal from "./DonationModal";
import "./WalletMenu.css";

const WalletMenu = memo(({ handleLogout, walletAddress, onClose }) => {
  const menuRef = useRef(null);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [balance, setBalance] = useState(null);

  // ✅ **Obtener balance de la wallet**
  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletAddress) {
        setBalance(0);
        return;
      }

      try {
        const walletBalance = await getWalletBalance(walletAddress);
        console.log(`✅ Balance actualizado: ${walletBalance} SOL`);
        setBalance(walletBalance);
      } catch (error) {
        console.error("❌ Error obteniendo balance:", error);
        setBalance(0);
      }
    };

    fetchBalance();
  }, [walletAddress]);

  // ✅ **Cerrar menú al hacer clic fuera**
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // ✅ **Copiar dirección de la wallet**
  const handleCopy = useCallback(async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        alert("✅ Dirección copiada al portapapeles.");
      } catch (error) {
        console.error("❌ Error copiando la dirección:", error);
      }
    }
  }, [walletAddress]);

  return (
    <>
      {walletAddress && (
        <div className="wallet-menu open" ref={menuRef}>
          <div className="wallet-menu-content">
            <header className="wallet-header">
              <p className="wallet-network">🔗 Solana</p>
              <p className="wallet-balance">{balance !== null ? `${balance.toFixed(2)} SOL` : "0 SOL"}</p>
            </header>

            <div className="wallet-address-container">
              <p className="wallet-address">{walletAddress}</p>
              <button className="copy-button" onClick={handleCopy} aria-label="Copy Address">
                <Copy size={18} />
              </button>
            </div>

            <button className="logout-button" onClick={handleLogout}>
              Disconnect
            </button>

            <button className="donate-button" onClick={() => setIsDonationOpen(true)}>
              Support Us ❤️
            </button>
          </div>
        </div>
      )}

      <DonationModal isOpen={isDonationOpen} onClose={() => setIsDonationOpen(false)} />
    </>
  );
});

export default WalletMenu;
