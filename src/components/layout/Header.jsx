import React from "react";
import WalletButton from "../common/WalletButton.jsx";
import "./Header.css";

const Header = React.memo(() => {
  return (
    <header className="header">
      <div className="header-inner">
        {/* Left zone of the header (title area) */}
        <div className="header-title-container">
          <h1 className="header-title">Deside</h1>
        </div>

        {/* Right zone of the header (wallet area) */}
        <div className="header-buttons-container">
          <WalletButton />
        </div>
      </div>
    </header>
  );
});

export default Header;
