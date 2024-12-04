import React from "react";
import WalletButton from "./WalletButton";
import "./Header.css";

function Header() {
    return (
        <header className="header">
            {/* Contenedor del título */}
            <div className="header-title-container">
                <h1 className="header-title">Log in</h1>
            </div>

            {/* Contenedor de los botones */}
            <div className="header-buttons-container">
                <WalletButton />
            </div>
        </header>
    );
}

export default Header;
