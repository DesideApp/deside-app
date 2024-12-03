import React from "react";
import WalletButton from "./WalletButton";
import "./Header.css";

function Header() {
    return (
        <header className="header">
            <h1 className="header-title">Log in</h1>
            <WalletButton />
        </header>
    );
}

export default Header;
