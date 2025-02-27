import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useWallet } from "./contexts/WalletContext"; // ✅ Importar contexto global
import { checkAuthStatus, logout } from "./services/authServices"; // ✅ Verificar autenticación
import Header from "./components/layout/Header.jsx";
import Home from "./pages/Home.jsx";
import Chat from "./pages/chat/Chat.jsx";
import BottomBar from "./components/layout/BottomBar.jsx";

function Main() {
    const { walletStatus, isReady } = useWallet(); // ✅ Obtener estado global
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const verifyAuthentication = async () => {
            if (!isReady) return;

            const authStatus = await checkAuthStatus();
            if (authStatus.isAuthenticated) {
                setIsAuthenticated(true);
            } else {
                console.warn("⚠️ Usuario no autenticado. Redirigiendo a Home...");
                logout();
                navigate("/");
            }
        };

        verifyAuthentication();
    }, [walletStatus, isReady, navigate]);

    return (
        <>
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route 
                        path="/chat" 
                        element={isAuthenticated ? <Chat /> : <Home />} 
                    />
                </Routes>
            </main>
            <BottomBar />
        </>
    );
}

export default Main;
