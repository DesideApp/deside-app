import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../contexts/WalletContext"; // ✅ Importamos el contexto global
import { checkAuthStatus } from "../../services/authServices"; // ✅ Validamos autenticación desde el backend
import ContactList from "../../components/chatcomps/ContactList.jsx";
import ChatWindow from "../../components/chatcomps/ChatWindow.jsx";
import RightPanel from "../../components/chatcomps/RightPanel.jsx";
import "./Chat.css";

function Chat() {
    const navigate = useNavigate();
    const { walletStatus, isReady } = useWallet(); // ✅ Estado de la wallet
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyAuthentication = async () => {
            if (!isReady) return;

            const status = await checkAuthStatus();
            setIsAuthenticated(status.isAuthenticated);
            setIsLoading(false); // ✅ Se detiene la carga después de verificar autenticación

            if (!status.isAuthenticated) {
                console.warn("⚠️ Usuario no autenticado. Redirigiendo a Home...");
                navigate("/");
            }
        };

        verifyAuthentication();
    }, [isReady, navigate]);

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
