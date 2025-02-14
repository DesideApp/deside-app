import React, { useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import { getConnectedWallet } from "../../services/walletService";
import useSignal from "../../hooks/useSignal";
import useWebRTC from "../../hooks/useWebRTC"; // ✅ Nuevo hook
import "./ChatWindow.css";

function ChatWindow({ selectedContact }) {
    const [walletAddress, setWalletAddress] = useState(null);
    const chatContainerRef = useRef(null);
    const { sendSignal, onSignal } = useSignal();

    useEffect(() => {
        const initWallet = async () => {
            const connectedWallet = await getConnectedWallet();
            if (connectedWallet) {
                setWalletAddress(connectedWallet.walletAddress);
            }
        };
        initWallet();
    }, []);

    // ✅ Usa el nuevo hook de WebRTC
    const { messages, sendMessage } = useWebRTC(selectedContact, walletAddress, !!walletAddress);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    if (!selectedContact) {
        return <p>🔍 Selecciona un contacto para empezar a chatear.</p>;
    }

    return (
        <div className="chat-window" ref={chatContainerRef}>
            <h3>Chatting with: {selectedContact}</h3>
            <div className="messages-container">
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
