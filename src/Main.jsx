import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useWallet } from "./contexts/WalletContext";
import { checkAuthStatus } from "./services/apiService.js";
import Header from "./components/layout/Header.jsx";
import Home from "./pages/Home.jsx";
import Chat from "./pages/chat/Chat.jsx";
import BottomBar from "./components/layout/BottomBar.jsx";

function Main() {
    const { isReady, walletStatus } = useWallet();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkedAuth, setCheckedAuth] = useState(false);

    useEffect(() => {
        const verifyAuthentication = async () => {
            if (!isReady) return;
            const authStatus = await checkAuthStatus();
            setIsAuthenticated(authStatus.isAuthenticated);
            setCheckedAuth(true);
        };

        verifyAuthentication();
    }, [isReady, walletStatus]);

    if (!checkedAuth) {
        return <div className="loading-screen">Cargando...</div>;
    }

    return (
        <>
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route 
                        path="/chat" 
                        element={isAuthenticated ? <Chat /> : <div>🔐 Debes iniciar sesión para acceder al chat.</div>} 
                    />
                </Routes>
            </main>
            <BottomBar />
        </>
    );
}

export default Main;
