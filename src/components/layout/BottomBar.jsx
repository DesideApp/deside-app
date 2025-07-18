import React, { useEffect, useRef, useState } from "react";
import "./BottomBar.css";
import NetworkStatus from "./NetworkStatus.jsx";
import SolanaPrice from "./SolanaPrice.jsx";
import DonationModal from "./DonationModal.jsx";
import { useLayout } from "../../contexts/LayoutContext";

const BottomBar = React.memo(() => {
  const { theme, toggleTheme, isTablet, isMobile } = useLayout();

  const swapButtonRef = useRef(null);
  const [isJupiterLoaded, setIsJupiterLoaded] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isJupiterLoaded) {
        const script = document.createElement("script");
        script.src = "https://terminal.jup.ag/main-v2.js";
        script.async = true;
        script.onload = () => setIsJupiterLoaded(true);
        document.body.appendChild(script);
        observer.disconnect();
      }
    });

    if (swapButtonRef.current) {
      observer.observe(swapButtonRef.current);
    }

    return () => observer.disconnect();
  }, [isJupiterLoaded]);

  const openJupiterSwap = () => {
    if (!window.Jupiter) return;
    if (!window.Jupiter.isInitialized) {
      window.Jupiter.init({
        mode: "modal",
        endpoint: "https://api.mainnet-beta.solana.com",
        enableWalletPassthrough: true,
        feeBps: 20,
        feeAccount: "Gwrn3UyMvrdSP8VsQZyTfAYp9qwrcu5ivBujKHufZJFZ",
        onSuccess: ({ txid }) => console.log("✅ Swap exitoso:", txid),
        onSwapError: ({ error }) => console.error("❌ Error en swap:", error),
      });
    }
    window.Jupiter.open();
  };

  const openDonationModal = () => setIsDonationOpen(true);
  const closeDonationModal = () => setIsDonationOpen(false);

  return (
    <>
      <footer
        className={`bottom-bar ${isTablet ? "is-tablet" : ""} ${isMobile ? "is-mobile" : ""}`}
      >
        <div className="bottom-bar-left-content">
          {/* 🔹 Interruptor Claro/Oscuro */}
          <div className="bubble type-b">
            <label className="switch">
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={toggleTheme}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="bottom-bar-right-content">
          {/* 🔹 Bubble: Donaciones */}
          <div className="bubble type-a donate-bubble" onClick={openDonationModal}>
            <span>❤️ Donate</span>
          </div>

          {/* 🔹 Swap de Jupiter */}
          <div
            ref={swapButtonRef}
            className="bubble type-a swap-bubble"
            onClick={openJupiterSwap}
          >
            <img
              src="https://jup.ag/svg/jupiter-logo.svg"
              alt="Jupiter"
              className="swap-icon"
            />
            <span>Jupiter</span>
          </div>

          {/* 🔹 Estado y precio SOL */}
          <div className="bubble type-a">
            <NetworkStatus />
            <SolanaPrice />
          </div>
        </div>
      </footer>

      {/* ✅ Modal de donación */}
      <DonationModal isOpen={isDonationOpen} onClose={closeDonationModal} />
    </>
  );
});

export default BottomBar;
