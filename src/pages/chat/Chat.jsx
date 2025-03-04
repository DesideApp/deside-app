import React, { useEffect, useState } from "react";
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

    useEffect(() => {
        const verifyAuthentication = async () => {
            if (!isReady || isLoading) return; // ✅ No repetir verificación si ya está cargando

            try {
                const status = await checkAuthStatus();
                setIsAuthenticated(status.isAuthenticated);
            } catch (error) {
                console.error("❌ Error verificando autenticación:", error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
                if (!status?.isAuthenticated) {
                    console.warn("⚠️ Usuario no autenticado. Redirigiendo a Home...");
                    navigate("/");
                }
            }
        };

        verifyAuthentication();
    }, [isReady, navigate]); // ✅ Eliminado `isAuthenticated` para evitar loops infinitos

    if (isLoading) {
        return <div className="loading-screen">🔄 Verificando autenticación...</div>;
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
