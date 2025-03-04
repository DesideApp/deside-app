import React from "react";
import { useNavigate } from 'react-router-dom';
import WalletButton from "../common/WalletButton.jsx"; // Asegúrate de que WalletButton está funcionando
import "./Header.css";

const Header = React.memo(() => {
    const navigate = useNavigate();

    const goToHome = () => navigate('/');
    const goToChat = () => navigate('/chat');

    return (
        <header className="header">
            {/* Contenedor del título */}
            <div className="header-title-container">
                <h1 className="header-title">Deside</h1>
            </div>

            {/* Contenedor de navegación */}
            <nav className="header-nav-container">
                <span onClick={goToHome} className="nav-link" aria-label="Ir a Home">Home</span>
                <span onClick={goToChat} className="nav-link" aria-label="Ir a Chat">Chat</span>
            </nav>

            {/* Contenedor de la wallet */}
            <div className="header-buttons-container">
                <WalletButton />
            </div>
        </header>
    );
});

export default Header;
