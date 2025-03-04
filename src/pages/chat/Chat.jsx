import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../contexts/WalletContext";
import { checkAuthStatus } from "../../services/apiService.js";
import ContactList from "../../components/chatcomps/ContactList.jsx";
import ChatWindow from "../../components/chatcomps/ChatWindow.jsx";
import RightPanel from "../../components/chatcomps/RightPanel.jsx";
import "./Chat.css";

function Chat() {
    const navigate = useNavigate();
    const { walletStatus, isReady } = useWallet();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;

        const verifyAuthentication = async () => {
            if (!isReady) return; // ✅ Esperar a que la wallet esté lista

            try {
                const status = await checkAuthStatus();
                if (isMounted.current) {
                    setIsAuthenticated(status?.isAuthenticated || false);
                }

                if (!status?.isAuthenticated && isMounted.current) {
                    console.warn("⚠️ Usuario no autenticado. Redirigiendo a Home...");
                    navigate("/");
                }
            } catch (error) {
                console.error("❌ Error verificando autenticación:", error);
                if (isMounted.current) {
                    setIsAuthenticated(false);
                }
            } finally {
                if (isMounted.current) setIsLoading(false);
            }
        };

        verifyAuthentication();

        return () => {
            isMounted.current = false; // ✅ Limpieza para evitar actualizaciones en componentes desmontados
        };
    }, [isReady, navigate]);

    if (isLoading) {
        return <div className="loading-screen" aria-live="assertive">🔄 Verificando autenticación...</div>;
    }

    return (
        <div className="chat-page-container">
            <div className="left-panel">
                <ContactList />
            </div>
            <div className="chat-window-panel">
                <ChatWindow />
            </div>
            <div className="right-panel">
                <RightPanel />
            </div>
        </div>
    );
}

export default Chat;
