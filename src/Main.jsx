import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header.jsx";
import Home from "./pages/Home.jsx";
import Chat from "./pages/chat/Chat.jsx";
import BottomBar from "./components/layout/BottomBar.jsx";

function Main() {
    return (
        <>
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    {/* ✅ Permite abrir chat con o sin walletAddress */}
                    <Route path="/chat/:walletAddress?" element={<Chat />} />
                </Routes>
            </main>
            <BottomBar />
        </>
    );
}

export default Main;
