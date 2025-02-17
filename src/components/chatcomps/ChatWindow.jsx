import React, { useEffect, useRef, useState, useCallback } from "react";
import ChatInput from "./ChatInput";
import { getConnectedWallet } from "../../services/walletService";
//import useWebRTC from "../../hooks/useWebRTC";
import "./ChatWindow.css";

function ChatWindow({ selectedContact }) {
    const [walletStatus, setWalletStatus] = useState({
        walletAddress: null,
        isAuthenticated: false
    });

    const chatContainerRef = useRef(null);

    // ✅ Optimiza la actualización del estado de la wallet
    const updateWalletStatus = useCallback(() => {
        const status = getConnectedWallet();
        setWalletStatus(status);
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

    // ✅ Se asegura de que `useWebRTC` se actualiza correctamente cuando cambia el estado de la wallet
    const { messages, sendMessage } = useWebRTC(
        selectedContact, 
        walletStatus.walletAddress, 
        walletStatus.isAuthenticated
    );

    // ✅ Scroll automático cuando llegan nuevos mensajes
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

                    <ChatInput onSendMessage={sendMessage} />
                </>
            )}
        </div>
    );
}

export default ChatWindow;
