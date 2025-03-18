import React, { useState, useEffect } from "react";
import "./BottomBar.css";
import NetworkStatus from "./NetworkStatus.jsx";
import SolanaPrice from "./SolanaPrice.jsx";
import { toggleTheme, getPreferredTheme } from "../../config/theme.js";

const BottomBar = React.memo(() => {
    const [isDarkMode, setIsDarkMode] = useState(getPreferredTheme() === "dark");

    useEffect(() => {
        // Inicializar Jupiter Terminal en modo Modal
        window.Jupiter?.init({
            mode: "modal",
            endpoint: "https://api.mainnet-beta.solana.com",
            enableWalletPassthrough: true,
            feeBps: 20, // 🔹 Fee en basis points (0.20%)
            feeAccount: "Gwrn3UyMvrdSP8VsQZyTfAYp9qwrcu5ivBujKHufZJFZ", // 🔹 Wallet que recibirá las fees
            onSuccess: ({ txid }) => console.log("✅ Swap exitoso:", txid),
            onSwapError: ({ error }) => console.error("❌ Error en swap:", error),
        });
    }, []);

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

                {/* 🔹 Swap de Jupiter */}
                <div className="bubble type-a swap-bubble" onClick={() => window.Jupiter?.open()}>
                    <img src="https://jup.ag/svg/jupiter-logo.svg" alt="Jupiter" className="swap-icon" />
                    <span>Swap</span>
                </div>
            </div>
        </footer>
    );
});

export default BottomBar;
