import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header.jsx";
import Chat from "./pages/chat/Chat.jsx";
import BottomBar from "./components/layout/BottomBar.jsx";

function Layout() {
    return (
        <>
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<Chat />} />
                    {/* aquí irán tus futuras rutas: /premium, /help, etc. */}
                </Routes>
            </main>
            <BottomBar />
        </>
    );
}

export default Layout;