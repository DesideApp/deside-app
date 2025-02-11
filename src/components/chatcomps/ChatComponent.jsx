import React, { useState, useEffect, useRef } from "react";
import { getConnectedWallet } from "../../services/walletService";
import useSignal from "../../hooks/useSignal";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import "./ChatComponent.css";

function ChatComponent({ selectedContact }) {
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

        console.log(`Initializing WebRTC with ${selectedContact}`);

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
            console.error("No selected contact.");
            return;
        }
        setMessages((prev) => [...prev, { sender: "me", text }]);
    };

    if (!selectedContact) {
        return <p>Select a contact to start chatting.</p>;
    }

    return (
        <div className="chat-component">
            <h3>Chatting with: {selectedContact}</h3>
            <ChatWindow messages={messages} />
            <ChatInput onSendMessage={sendMessage} />
        </div>
    );
}

export default ChatComponent;
