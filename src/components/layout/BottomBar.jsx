import React, { useState } from "react";
import "./BottomBar.css";
import NetworkStatus from "./NetworkStatus.jsx";
import SolanaPrice from "./SolanaPrice.jsx";
import { toggleTheme, getPreferredTheme } from "../../config/theme.js"; // ✅ Conectar con el sistema de temas

const BottomBar = React.memo(() => {
    const [isDarkMode, setIsDarkMode] = useState(getPreferredTheme() === "dark");

    /** 🔹 **Alternar entre Claro/Oscuro sin cambiar color del botón** */
    const handleThemeToggle = () => {
        toggleTheme();
        setIsDarkMode((prev) => !prev);
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
                        <input type="checkbox" checked={isDarkMode} onChange={handleThemeToggle} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
        </footer>
    );
});

export default BottomBar;
