import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useWallet } from "./contexts/WalletContext"; // ✅ Contexto global
import { checkAuthStatus } from "./services/authServices"; // ✅ Verificar autenticación
import Header from "./components/layout/Header.jsx";
import Home from "./pages/Home.jsx";
import Chat from "./pages/chat/Chat.jsx";
import BottomBar from "./components/layout/BottomBar.jsx";

function Main() {
    const { isReady, walletStatus } = useWallet(); // ✅ Obtener estado global
    const navigate = useNavigate();
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
                    <Route path="/chat" element={isAuthenticated ? <Chat /> : <Home />} />
                </Routes>
            </main>
            <BottomBar />
        </>
    );
}

export default Main;
