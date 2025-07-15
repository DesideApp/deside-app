import React, { useEffect, useRef } from "react";
import "./BottomBar.css";
import NetworkStatus from "./NetworkStatus.jsx";
import SolanaPrice from "./SolanaPrice.jsx";
import { useLayout } from "../../contexts/LayoutContext";

const BottomBar = React.memo(() => {
  const { theme, toggleTheme, isTablet, isMobile } = useLayout();

  const swapButtonRef = useRef(null);
  const [isJupiterLoaded, setIsJupiterLoaded] = React.useState(false);

  useEffect(() => {
    // 🚀 Lazy Load con IntersectionObserver
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isJupiterLoaded) {
        console.log("👀 Swap visible → Cargando Jupiter Terminal...");
        const script = document.createElement("script");
        script.src = "https://terminal.jup.ag/main-v2.js";
        script.async = true;
        script.onload = () => {
          console.log("✅ Jupiter Terminal cargado. NO se abrirá automáticamente.");
          setIsJupiterLoaded(true);
        };
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
    if (!window.Jupiter) {
      console.warn("⚠️ Jupiter Terminal aún no ha cargado.");
      return;
    }
    if (!window.Jupiter.isInitialized) {
      console.log("🔄 Inicializando Jupiter antes de abrir...");
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
    window.Jupiter.open(); // 🔥 SOLO se abre cuando el usuario hace click
  };

  return (
    <footer
      className={`bottom-bar
        ${isTablet ? "is-tablet" : ""}
        ${isMobile ? "is-mobile" : ""}
      `}
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
        {/* 🔹 Estado y precio de SOL */}
        <div className="bubble type-a">
          <NetworkStatus />
          <SolanaPrice />
        </div>

        {/* 🔹 Swap de Jupiter con Lazy Load (NO se abre solo) */}
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
      </div>
    </footer>
  );
});

export default BottomBar;
