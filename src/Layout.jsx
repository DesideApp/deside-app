import React from "react";
import { Routes, Route } from "react-router-dom";
import LeftBar from "./components/layout/LeftBar.jsx";
import Header from "./components/layout/Header.jsx";
import BottomBar from "./components/layout/BottomBar.jsx";
import Chat from "./pages/chat/Chat.jsx";
import { useLayout } from "./contexts/LayoutContext.jsx";
import "./Layout.css";

function Layout() {
  const {
    leftbarExpanded,
    leftbarWidth,
  } = useLayout();

  return (
    <div
      className="layout-wrapper"
    >
      <LeftBar />
      <Header />
      <main className="layout-content">
        <Routes>
          <Route path="/" element={<Chat />} />
          {/* aquí puedes meter más routes */}
        </Routes>
      </main>
      <BottomBar />
    </div>
  );
}

export default Layout;
