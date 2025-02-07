import React, { useState, useEffect, useRef } from "react";
import { getConnectedWallet } from "../../services/walletService";
import useSignal from "../../hooks/useSignal";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import "./ChatComponent.css";

function ChatComponent({ selectedContact }) {
    const [walletAddress, setWalletAddress] = useState(null);
    const [messages, setMessages] = useState([]);
    const [peerConnection, setPeerConnection] = useState(null);
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

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal(selectedContact, {
                    type: "ice-candidate",
                    candidate: event.candidate,
                });
            }
        };

        peer.ondatachannel = (event) => {
            const receiveChannel = event.channel;
            receiveChannel.onmessage = (e) => {
                setMessages((prev) => [...prev, { sender: "peer", text: e.data }]);
            };
        };

        setPeerConnection(peer);

        onSignal((data) => {
            if (data.type === "offer") {
                peer.setRemoteDescription(new RTCSessionDescription(data.offer))
                    .then(() => peer.createAnswer())
                    .then((answer) => peer.setLocalDescription(answer))
                    .then(() => sendSignal(selectedContact, { type: "answer", answer: peer.localDescription }));
            } else if (data.type === "answer") {
                peer.setRemoteDescription(new RTCSessionDescription(data.answer));
            } else if (data.type === "ice-candidate") {
                peer.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });

        return () => {
            peer.close();
            setPeerConnection(null);
        };
    }, [walletAddress, selectedContact]);

    const sendMessage = (text) => {
        if (!peerConnection) {
            console.error("No peer connection available.");
            return;
        }
        const dataChannel = peerConnection.createDataChannel("chat");
        dataChannel.onopen = () => dataChannel.send(text);
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
