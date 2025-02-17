import React, { useEffect, useRef, useState, useCallback } from "react";
import ChatInput from "./ChatInput";
import { ensureWalletState } from "../../services/walletService"; // 🔥 CENTRALIZAMOS AUTENTICACIÓN
import useWebRTC from "../../hooks/useWebRTC";
import "./ChatWindow.css";

function ChatWindow({ selectedContact }) {
    const [walletStatus, setWalletStatus] = useState({
        walletAddress: null,
        isAuthenticated: false
    });

    const chatContainerRef = useRef(null);

    // ✅ **Centraliza la autenticación y conexión**
    const updateWalletStatus = useCallback(async () => {
        const status = await ensureWalletState(); // 🔥 **Evita duplicar lógica en cada componente**
        setWalletStatus(status || { walletAddress: null, isAuthenticated: false });
    }, []);

    useEffect(() => {
        updateWalletStatus();
        window.addEventListener("walletConnected", updateWalletStatus);
        window.addEventListener("walletDisconnected", updateWalletStatus);

        return () => {
            window.removeEventListener("walletConnected", updateWalletStatus);
            window.removeEventListener("walletDisconnected", updateWalletStatus);
        };
    }, [updateWalletStatus]);

    // ✅ **Solo inicializar WebRTC si la wallet está lista**
    const { messages, sendMessage } = useWebRTC(
        selectedContact, 
        walletStatus.walletAddress, 
        walletStatus.isAuthenticated
    );

    // ✅ **Evita re-renderizados innecesarios y mantiene el scroll en el último mensaje**
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="chat-window">
            {!selectedContact ? (
                <p className="chat-placeholder">🔍 Selecciona un contacto para empezar a chatear.</p>
            ) : (
                <>
                    <div className="chat-header">
                        <h3>
                            💬 Chat con:{" "}
                            <span title={selectedContact}>
                                {selectedContact.slice(0, 6)}...{selectedContact.slice(-4)}
                            </span>
                        </h3>
                    </div>

                    <div className="chat-messages" ref={chatContainerRef}>
                        {messages.length > 0 ? (
                            messages.map((msg, index) => (
                                <div key={index} className={`chat-message ${msg.sender === "me" ? "sent" : "received"}`}>
                                    {msg.text}
                                </div>
                            ))
                        ) : (
                            <p className="no-messages">🔹 No hay mensajes todavía.</p>
                        )}
                    </div>

                    {/* ✅ **Deshabilita ChatInput si la wallet no está lista** */}
                    <ChatInput onSendMessage={sendMessage} disabled={!walletStatus.isAuthenticated} />
                </>
            )}
        </div>
    );
}

export default ChatWindow;
