import React from "react";
import { useNavigate } from 'react-router-dom';
import WalletButton from "./WalletButton";
import "./Header.css";

function Header() {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        console.log(`Navigating to ${path}`); // Log de navegación
        navigate(path);
    };

    return (
        <header className="header">
            {/* Contenedor del título */}
            <div className="header-title-container">
                <h1 className="header-title">My App</h1>
            </div>

            {/* Contenedor de navegación */}
            <nav className="header-nav-container">
                <span onClick={() => handleNavigation('/')} className="nav-link">Home</span>
                <span onClick={() => handleNavigation('/chat')} className="nav-link">Chat</span>
            </nav>

            {/* Contenedor de la wallet */}
            <div className="header-buttons-container">
                <WalletButton /> {/* Instancia de WalletButton */}
            </div>
        </header>
    );
}

export default Header;
