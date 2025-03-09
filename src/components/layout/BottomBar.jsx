import React, { useState } from "react";
import "./BottomBar.css";
import NetworkStatus from "./NetworkStatus.jsx";
import SolanaPrice from "./SolanaPrice.jsx";
import { toggleTheme, getPreferredTheme } from "../../config/theme.js"; 

const BottomBar = React.memo(() => {
    const [isDarkMode, setIsDarkMode] = useState(getPreferredTheme() === "dark");

    /** 🔹 **Alternar entre Claro/Oscuro sin cambiar color del botón** */
    const handleThemeToggle = () => {
        toggleTheme();
        setIsDarkMode((prev) => !prev);
    };

    return (
        <footer className="bottom-bar">
            <div className="bottom-bar-content">
                {/* 🔹 Interruptor Claro/Oscuro (🔥 Pegado a la izquierda del estado & precio) */}
                <div className="bubble type-b">
                    <label className="switch">
                        <input type="checkbox" checked={isDarkMode} onChange={handleThemeToggle} />
                        <span className="slider"></span>
                    </label>
                </div>

                {/* 🔹 Estado y precio de SOL (Mantiene su posición) */}
                <div className="bubble type-a">
                    <NetworkStatus />
                    <SolanaPrice />
                </div>
            </div>
        </footer>
    );
});

export default BottomBar;
