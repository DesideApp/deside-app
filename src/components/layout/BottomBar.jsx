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
                {/* 🔹 Estado y precio de SOL (🔥 Posicionado correctamente a la derecha) */}
                <div className="bubble type-a">
                    <NetworkStatus />
                    <SolanaPrice />
                </div>

                {/* 🔹 Interruptor Claro/Oscuro (🔥 Pegado a la izquierda de la otra burbuja) */}
                <div className="bubble type-b">
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
