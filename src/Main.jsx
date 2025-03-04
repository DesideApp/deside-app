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
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const verifyAuthentication = async () => {
            if (!isReady) return;

            try {
                const authStatus = await checkAuthStatus();
                setIsAuthenticated(authStatus?.isAuthenticated || false);
            } catch (error) {
                console.error("❌ Error verificando autenticación:", error);
                setIsAuthenticated(false);
            } finally {
                setIsCheckingAuth(false); // ✅ Solo se verifica una vez al cargar la app
            }
        };

        verifyAuthentication();
    }, [isReady]); // ✅ Se ejecuta solo cuando `isReady` cambia

    return (
        <>
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route 
                        path="/chat" 
                        element={isCheckingAuth ? (
                            <div className="loading-screen">🔄 Verificando autenticación...</div>
                        ) : isAuthenticated ? (
                            <Chat />
                        ) : (
                            <div className="auth-warning">🔐 Debes iniciar sesión para acceder al chat.</div>
                        )}
                    />
                </Routes>
            </main>
            <BottomBar />
        </>
    );
}

export default Main;
