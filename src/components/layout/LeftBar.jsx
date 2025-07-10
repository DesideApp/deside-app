import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Star,
  HelpCircle,
  Settings,
  Sun,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import WalletButton from "../common/WalletButton.jsx";
import { toggleTheme } from "../../config/theme.js";
import { useLayout } from "../../contexts/LayoutContext";
import "./LeftBar.css";

const LeftBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    leftbarExpanded,
    setLeftbarExpanded,
    setRightPanelOpen,
  } = useLayout();

  // 🔥 Si se abre WalletMenu, colapsa la LeftBar
  useEffect(() => {
    const handleWalletMenuOpened = () => {
      setLeftbarExpanded(false);
    };

    window.addEventListener("walletMenuOpened", handleWalletMenuOpened);
    return () => {
      window.removeEventListener("walletMenuOpened", handleWalletMenuOpened);
    };
  }, [setLeftbarExpanded]);

  const toggleLeftbar = () => {
    setLeftbarExpanded((prev) => {
      const next = !prev;

      if (next) {
        // 🔥 Si vamos a abrir LeftBar → cerramos Right Panel
        setRightPanelOpen(false);
        window.dispatchEvent(new Event("leftbarOpened"));
      }
      return next;
    });
  };

  const pages = [
    { path: "/", icon: <MessageCircle />, label: "Chat" },
    { path: "/premium", icon: <Star />, label: "Premium" },
    { path: "/help", icon: <HelpCircle />, label: "Help" },
  ];

  const other = [
    {
      icon: <Settings />,
      label: "Settings",
      action: () =>
        window.dispatchEvent(new Event("openSettingsPanel")),
    },
    { icon: <Sun />, label: "Theme", action: toggleTheme },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`leftbar ${leftbarExpanded ? "expanded" : ""}`}>
      <button
        className="leftbar-toggle"
        onClick={toggleLeftbar}
        title={leftbarExpanded ? "Collapse" : "Expand"}
      >
        {leftbarExpanded ? <ChevronLeft /> : <ChevronRight />}
      </button>

      <div className="leftbar-icons">
        {pages.map((link) => (
          <button
            key={link.path}
            className={`leftbar-button ${
              isActive(link.path) ? "active" : ""
            }`}
            onClick={() => navigate(link.path)}
            title={link.label}
          >
            {link.icon}
            {leftbarExpanded && (
              <span className="leftbar-label">{link.label}</span>
            )}
          </button>
        ))}
      </div>

      <div className="leftbar-divider"></div>

      <div className="leftbar-icons">
        {other.map((item) => (
          <button
            key={item.label}
            className="leftbar-button"
            onClick={item.action}
            title={item.label}
          >
            {item.icon}
            {leftbarExpanded && (
              <span className="leftbar-label">{item.label}</span>
            )}
          </button>
        ))}
        <div className="leftbar-wallet">
          <WalletButton />
        </div>
      </div>
    </aside>
  );
};

export default LeftBar;
