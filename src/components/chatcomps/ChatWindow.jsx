import React, { useEffect, useRef, useState, useCallback } from "react";
import ChatInput from "./ChatInput";
import { getConnectedWallet, isWalletRegistered } from "../../services/walletService";
import useWebRTC from "../../hooks/useWebRTC";
import "./ChatWindow.css";

function ChatWindow({ selectedContact }) {
    const [walletStatus, setWalletStatus] = useState({
        walletAddress: null,
        isAuthenticated: false,
        isRegistered: false
    });

    const chatContainerRef = useRef(null);

    // ✅ Optimización de `updateWalletStatus` con `useCallback`
    const updateWalletStatus = useCallback(async () => {
        const status = getConnectedWallet();
        
        if (status.walletAddress) {
            const registered = await isWalletRegistered(status.walletAddress);
            setWalletStatus({ ...status, isRegistered: registered });
        } else {
            setWalletStatus({ walletAddress: null, isAuthenticated: false, isRegistered: false });
        }
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

    // ✅ Se ejecuta WebRTC solo si la wallet está autenticada y registrada
    const { messages, sendMessage } = useWebRTC(
        selectedContact, 
        walletStatus.walletAddress, 
        walletStatus.isAuthenticated && walletStatus.isRegistered
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
