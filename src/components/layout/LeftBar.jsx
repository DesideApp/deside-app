import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Star,
  HelpCircle,
  Settings
} from "lucide-react";
import { useLayout } from "../../contexts/LayoutContext";
import "./LeftBar.css";

const LeftBarLogo = () => {
  const { theme } = useLayout();

  const logoSrc =
    theme === "dark"
      ? "/assets/logo-dark.svg"
      : "/assets/logo-light.svg";

  return (
    <img
      src={logoSrc}
      alt="Logo"
      className="leftbar-logo-icon"
    />
  );
};

const LeftBar = () => {
  // ✅ METEMOS theme AQUÍ PARA FORZAR RERENDER
  const { theme, leftbarExpanded, toggleLeftbar, setRightPanelOpen } = useLayout();
  const location = useLocation();
  const navigate = useNavigate();

  const leftbarRef = useRef(null);

  const pages = [
    { path: "/", icon: <MessageCircle size={24} />, label: "CHAT" },
    { path: "/premium", icon: <Star size={24} />, label: "PREMIUM" },
    { path: "/documents", icon: <HelpCircle size={24} />, label: "DOCUMENTS" },
  ];

  const options = [
    {
      icon: <Settings size={24} />,
      label: "Settings",
      action: () => {
        setRightPanelOpen(false);
        window.dispatchEvent(new Event("openSettingsPanel"));
      },
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      ref={leftbarRef}
      className={`leftbar ${leftbarExpanded ? "expanded" : ""}`}
    >
      <div
        className="leftbar-inner"
        onClick={toggleLeftbar}
      >
        {/* SVG LOGO */}
        <div
          className="leftbar-logo"
          onClick={(e) => {
            e.stopPropagation();
            toggleLeftbar();
          }}
        >
          <LeftBarLogo />
        </div>

        {/* TOP SECTION */}
        <div className="leftbar-section top-section">
          {pages.map((link) => (
            <button
              key={link.path}
              className={`leftbar-button ${isActive(link.path) ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                navigate(link.path);
              }}
              title={link.label}
            >
              {link.icon}
              {leftbarExpanded && <span className="leftbar-label">{link.label}</span>}
            </button>
          ))}
        </div>

        {/* BOTTOM SECTION */}
        <div className="leftbar-section bottom-section">
          {options.map((item) => (
            <button
              key={item.label}
              className="leftbar-button"
              onClick={(e) => {
                e.stopPropagation();
                item.action();
              }}
              title={item.label}
            >
              {item.icon}
              {leftbarExpanded && <span className="leftbar-label">{item.label}</span>}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default LeftBar;
