import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Star,
  HelpCircle,
  Settings
} from "lucide-react";
import { useLayout } from "../../contexts/LayoutContext";
import "./LeftBar.css";

const LeftBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDesktop, setRightPanelOpen } = useLayout();

  const [expanded, setExpanded] = useState(false);
  const leftbarRef = useRef(null);

  const toggleLeftbar = () => {
    setExpanded((prev) => !prev);
    setRightPanelOpen(false);
  };

  const closeLeftbar = () => {
    setExpanded(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (expanded && leftbarRef.current && !leftbarRef.current.contains(e.target)) {
        closeLeftbar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expanded]);

  const pages = [
    { path: "/", icon: <MessageCircle size={24} />, label: "Chat" },
    { path: "/premium", icon: <Star size={24} />, label: "Premium" },
    { path: "/help", icon: <HelpCircle size={24} />, label: "Help" },
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
      className={`leftbar ${expanded ? "expanded" : ""} ${isDesktop ? "is-desktop" : ""}`}
      onClick={toggleLeftbar}
    >
      <div className="leftbar-inner">
        {/* D LOGO */}
        <div className="leftbar-logo">
          <span className="logo-text">D</span>
          {expanded && <span className="logo-label">Deside</span>}
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
              {expanded && <span className="leftbar-label">{link.label}</span>}
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
              {expanded && <span className="leftbar-label">{item.label}</span>}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default LeftBar;
