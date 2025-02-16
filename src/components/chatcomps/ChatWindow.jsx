import React, { useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import { getConnectedWallet } from "../../services/walletService";
import useWebRTC from "../../hooks/useWebRTC";
import "./ChatWindow.css";

function ChatWindow({ selectedContact }) {
    const [walletStatus, setWalletStatus] = useState({
        walletAddress: null,
        isAuthenticated: false
    });

    const chatContainerRef = useRef(null);

    useEffect(() => {
        setWalletStatus(getConnectedWallet());
    }, []);

    // ✅ Usa WebRTC solo si hay contacto seleccionado y wallet autenticada
    const { messages, sendMessage } = useWebRTC(
        selectedContact, 
        walletStatus.walletAddress, 
        walletStatus.isAuthenticated
    );

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
                        <h3>💬 Chat con: {selectedContact.slice(0, 6)}...{selectedContact.slice(-4)}</h3>
                    </div>

                    {!walletStatus.isAuthenticated && (
                        <p className="auth-warning">⚠️ Firma con tu wallet para poder chatear.</p>
                    )}

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
