import React, { useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import { getConnectedWallet } from "../../services/walletService";
import useWebRTC from "../../hooks/useWebRTC"; 
import "./ChatWindow.css";

function ChatWindow({ selectedContact }) {
    const [walletAddress, setWalletAddress] = useState(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        const initWallet = async () => {
            const connectedWallet = await getConnectedWallet();
            if (connectedWallet?.walletAddress) {
                setWalletAddress(connectedWallet.walletAddress);
            }
        };
        initWallet();
    }, []);

    // ✅ Usa WebRTC solo si hay contacto seleccionado y wallet autenticada
    const { messages, sendMessage } = useWebRTC(selectedContact, walletAddress, !!walletAddress);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    if (!selectedContact) {
        return <p className="chat-placeholder">🔍 Selecciona un contacto para empezar a chatear.</p>;
    }

    return (
        <div className="chat-window" ref={chatContainerRef}>
            <div className="chat-header">
                <h3>Chat con: {selectedContact.slice(0, 6)}...{selectedContact.slice(-4)}</h3>
            </div>

            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.sender === "me" ? "sent" : "received"}`}>
                        {msg.text}
                    </div>
                ))}
            </div>

            <ChatInput onSendMessage={sendMessage} />
        </div>
    );
}

export default ChatWindow;
