import React from "react";
import WalletButton from "../common/WalletButton.jsx";
import { useLayout } from "../../contexts/LayoutContext";
import "./Header.css";

const Header = React.memo(() => {
  const { isDesktop, isTablet, isMobile } = useLayout();

  return (
    <header
      className={`header 
        ${isDesktop ? "is-desktop" : ""}
        ${isTablet ? "is-tablet" : ""}
        ${isMobile ? "is-mobile" : ""}
      `}
    >
      {/* Left zone of the header (title area) */}
      <div className="header-title-container">
        <h1 className="header-title">Deside</h1>
      </div>

      {/* Right zone of the header (wallet area) */}
      <div className="header-buttons-container">
        <WalletButton />
      </div>
    </header>
  );
});

export default Header;
