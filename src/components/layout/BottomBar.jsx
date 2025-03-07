import React, { useState } from "react";
import "./BottomBar.css";
import NetworkStatus from "./NetworkStatus.jsx";
import SolanaPrice from "./SolanaPrice.jsx";

const BottomBar = React.memo(() => {
    const [isDarkMode, setIsDarkMode] = useState(false); // ✅ Estado para el tema

    /** 🔹 **Alternar el modo de tema (aún sin aplicar lógica real)** */
    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
        console.log(`🌗 Modo cambiado a: ${isDarkMode ? "Claro" : "Oscuro"}`);
    };

    return (
        <footer className="bottom-bar">
            {/* 🔹 Contenedor que agrupa estado y precio de SOL */}
            <div className="bottom-bar-content">
                <div className="bubble network-bubble">
                    <NetworkStatus />
                    <SolanaPrice />
                </div>

                {/* 🔹 Interruptor Claro/Oscuro */}
                <div className="bubble settings-bubble">
                    <label className="switch">
                        <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
        </footer>
    );
});

export default BottomBar;
