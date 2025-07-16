import React, { useState, useEffect, memo } from "react";
import {
  detectWallet,
  handleWalletSelected,
  handleLogoutClick,
  getWalletState,
} from "../../services/walletStateService.js";
import { getWalletBalance } from "../../services/walletBalanceService.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import { useLayout } from "../../contexts/LayoutContext";
import "./WalletButton.css";

const WalletButton = memo(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletState, setWalletState] = useState(getWalletState());
  const [balance, setBalance] = useState(null);

  const { setLeftbarExpanded } = useLayout();

  // ✅ Detect wallet automatically on mount
  useEffect(() => {
    const initializeWallet = async () => {
      const state = await detectWallet();
      setWalletState(state);

      if (state.pubkey) {
        const balance = await getWalletBalance(state.pubkey);
        setBalance(balance);
      }
    };

    initializeWallet();
  }, []);

  // ✅ Listen for LeftbarOpened → close WalletMenu
  useEffect(() => {
    const handleLeftbarOpened = () => {
      setIsMenuOpen(false);
    };

    window.addEventListener("leftbarOpened", handleLeftbarOpened);
    return () => {
      window.removeEventListener("leftbarOpened", handleLeftbarOpened);
    };
  }, []);

  // ✅ Listen for WalletMenuOpened → collapse LeftBar
  useEffect(() => {
    const handleWalletMenuOpened = () => {
      setLeftbarExpanded(false);
    };

    window.addEventListener("walletMenuOpened", handleWalletMenuOpened);
    return () => {
      window.removeEventListener("walletMenuOpened", handleWalletMenuOpened);
    };
  }, [setLeftbarExpanded]);

  // ✅ Handle Connect / Toggle WalletMenu
  const handleConnectClick = () => {
    if (!walletState.pubkey) {
      setIsModalOpen(true);
    } else {
      window.dispatchEvent(new Event("walletMenuOpened"));
      setIsMenuOpen((prev) => !prev);
    }
  };

  const handleMenuToggle = () => {
    window.dispatchEvent(new Event("walletMenuOpened"));
    setIsMenuOpen((prev) => !prev);
  };

  const handleWalletSelection = async (walletType) => {
    const result = await handleWalletSelected(walletType);
    setWalletState(result);

    if (result.pubkey) {
      const balance = await getWalletBalance(result.pubkey);
      setBalance(balance);
    } else {
      setBalance(null);
    }

    setIsModalOpen(false);
  };

  const logout = async () => {
    await handleLogoutClick();
    setWalletState({ pubkey: null });
    setBalance(null);
    setIsMenuOpen(false);
  };

  const formattedBalance = walletState.pubkey
    ? typeof balance === "number"
      ? `${balance.toFixed(2)} SOL`
      : `${walletState.pubkey.slice(0, 5)}...`
    : "Log in";

  return (
    <div className="wallet-container">
      <div className="wallet-button-wrapper">
        <button className="wallet-button" onClick={handleConnectClick}>
          <span>{formattedBalance}</span>
        </button>
      </div>

      <div className="menu-button-wrapper">
        <button
          className="menu-button"
          onClick={handleMenuToggle}
          aria-label="Toggle Wallet Menu"
        >
          <div className="menu-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      <WalletMenu
        isOpen={isMenuOpen}
        handleLogout={logout}
        onClose={() => setIsMenuOpen(false)}
        walletAddress={walletState.pubkey}
        balance={balance}
        openWalletModal={() => setIsModalOpen(true)}
      />

      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onWalletSelected={handleWalletSelection}
      />
    </div>
  );
});

export default WalletButton;
