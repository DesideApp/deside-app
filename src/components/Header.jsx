import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import WalletButton from "./WalletButton";
import "./Header.css";


function Header() {
    const navigate = useNavigate();

    return (
        <header className="header">
            {/* Contenedor del título */}
            <div className="header-title-container">
                <h1 className="header-title">Deside</h1>
            </div>

            {/* Contenedor de navegación */}
            <nav className="header-nav-container">
                <span onClick={() => navigate('/')} className="nav-link">Home</span>
                <span onClick={() => navigate('/chat')} className="nav-link">Chat</span>
            </nav>

            {/* Contenedor de la wallet */}
            <div className="header-buttons-container">
                <WalletButton /> 
            </div>
        </header>
    );
}

export default Header;
