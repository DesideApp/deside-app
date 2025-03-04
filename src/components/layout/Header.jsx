import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import WalletButton from "../common/WalletButton.jsx";
import "./Header.css";

const Header = React.memo(() => {
    const navigate = useNavigate();

    const goToHome = useCallback(() => navigate("/"), [navigate]);
    const goToChat = useCallback(() => navigate("/chat"), [navigate]);

    return (
        <header className="header">
            {/* Contenedor del título */}
            <div className="header-title-container">
                <h1 className="header-title">Deside</h1>
            </div>

            {/* Contenedor de navegación */}
            <nav className="header-nav-container" role="navigation">
                <span
                    onClick={goToHome}
                    className="nav-link"
                    aria-label="Ir a Home"
                    tabIndex="0"
                >
                    Home
                </span>
                <span
                    onClick={goToChat}
                    className="nav-link"
                    aria-label="Ir a Chat"
                    tabIndex="0"
                >
                    Chat
                </span>
            </nav>

            {/* Contenedor de la wallet */}
            <div className="header-buttons-container">
                <WalletButton />
            </div>
        </header>
    );
});

export default Header;
