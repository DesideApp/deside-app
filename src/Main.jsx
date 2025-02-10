import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Chat from "./pages/chat/Chat.jsx";
import BottomBar from "./components/BottomBar.jsx";

function Main() {
    return (
        <div>
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/chat/:walletAddress" element={<Chat />} /> 
                </Routes>
            </main>
            <BottomBar />
        </div>
    );
}

export default Main;
