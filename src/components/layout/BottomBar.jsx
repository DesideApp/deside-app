import React, { useState, useEffect, useRef } from "react";
import "./BottomBar.css";
import NetworkStatus from "./NetworkStatus.jsx";
import SolanaPrice from "./SolanaPrice.jsx";
import { toggleTheme, getPreferredTheme } from "../../config/theme.js";

const BottomBar = React.memo(() => {
    const [isDarkMode, setIsDarkMode] = useState(getPreferredTheme() === "dark");
    const swapButtonRef = useRef(null);
    const [isJupiterLoaded, setIsJupiterLoaded] = useState(false);

    useEffect(() => {
        // 🚀 Lazy Load con IntersectionObserver
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !isJupiterLoaded) {
                console.log("👀 Swap visible → Cargando Jupiter Terminal...");
                const script = document.createElement("script");
                script.src = "https://terminal.jup.ag/main-v2.js";
                script.async = true;
                script.onload = () => {
                    window.Jupiter.init({
                        mode: "modal",
                        endpoint: "https://api.mainnet-beta.solana.com",
                        enableWalletPassthrough: true,
                        feeBps: 20,
                        feeAccount: "Gwrn3UyMvrdSP8VsQZyTfAYp9qwrcu5ivBujKHufZJFZ",
                        onSuccess: ({ txid }) => console.log("✅ Swap exitoso:", txid),
                        onSwapError: ({ error }) => console.error("❌ Error en swap:", error),
                    });
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

    return (
        <footer className="bottom-bar">
            <div className="bottom-bar-content">
                {/* 🔹 Estado y precio de SOL */}
                <div className="bubble type-a">
                    <NetworkStatus />
                    <SolanaPrice />
                </div>

                {/* 🔹 Interruptor Claro/Oscuro */}
                <div className="bubble type-b">
                    <label className="switch">
                        <input type="checkbox" checked={isDarkMode} onChange={() => {
                            toggleTheme();
                            setIsDarkMode((prev) => !prev);
                        }} />
                        <span className="slider"></span>
                    </label>
                </div>

                {/* 🔹 Swap de Jupiter con Lazy Load */}
                <div ref={swapButtonRef} className="bubble type-a swap-bubble" onClick={() => window.Jupiter?.open()}>
                    <img src="https://jup.ag/svg/jupiter-logo.svg" alt="Jupiter" className="swap-icon" />
                    <span>Jupiter Swap</span>
                </div>
            </div>
        </footer>
    );
});

export default BottomBar;
