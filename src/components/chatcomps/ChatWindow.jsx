import React, { useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import { getConnectedWallet } from "../../services/walletService";
import useSignal from "../../hooks/useSignal";
import "./ChatWindow.css";

function ChatWindow({ selectedContact }) {
    const [walletAddress, setWalletAddress] = useState(null);
    const [messages, setMessages] = useState([]);
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

    useEffect(() => {
        if (!walletAddress || !selectedContact) return;

        console.log(`🔵 Estableciendo conexión con ${selectedContact} vía WebRTC`);

        const peer = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        peer.ondatachannel = (event) => {
            const receiveChannel = event.channel;
            receiveChannel.onmessage = (e) => {
                setMessages((prev) => [...prev, { sender: "peer", text: e.data }]);
            };
        };

        return () => {
            peer.close();
        };
    }, [walletAddress, selectedContact]);

    const sendMessage = (text) => {
        if (!selectedContact) {
            console.error("❌ No hay contacto seleccionado.");
            return;
        }
        setMessages((prev) => [...prev, { sender: "me", text }]);
    };

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
