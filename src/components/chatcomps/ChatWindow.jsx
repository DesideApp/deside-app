import React, { useEffect, useRef, useState, useCallback } from "react";
import WrittingPanel from "./WrittingPanel";
import useWebRTC from "../../hooks/useWebRTC";
import { io } from "socket.io-client";
import { useAuthManager } from "../../services/authManager";
import "./ChatWindow.css";

function ChatWindow({ selectedContact }) {
    const { isAuthenticated, selectedWallet, handleLoginResponse } = useAuthManager();
    const chatContainerRef = useRef(null);
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [confirmedContacts, setConfirmedContacts] = useState([]);

    // ✅ **Obtener lista de contactos confirmados SOLO si estamos autenticados**
    const fetchContacts = useCallback(async () => {
        if (!selectedWallet || !isAuthenticated) return;
        try {
            const contacts = await getContacts();
            setConfirmedContacts(contacts.confirmed.map((c) => c.wallet));
        } catch (error) {
            console.error("❌ Error obteniendo contactos:", error);
        }
    }, [selectedWallet, isAuthenticated]);

    // ✅ **Inicializar WebSocket solo si el usuario está autenticado y tiene contacto seleccionado**
    const initializeSocket = useCallback(() => {
        if (!selectedWallet || !selectedContact || !isAuthenticated) return;

        if (!confirmedContacts.includes(selectedContact)) {
            console.warn("⚠️ Intento de chat con un contacto no confirmado.");
            return;
        }

        if (socketRef.current) {
            console.log("⚡ WebSocket ya está conectado, evitando reconexión.");
            return;
        }

        console.log("🔵 Conectando a WebSocket...");
        const socket = io(import.meta.env.VITE_WEBSOCKET_URL, {
            transports: ["websocket"],
            withCredentials: true,
        });

        socket.on("connect", () => {
            console.log("🟢 Conectado al servidor WebSocket");
            setIsConnected(true);
            socket.emit("register_wallet", selectedWallet);
        });

        socket.on("disconnect", () => {
            console.warn("🔴 Desconectado del servidor WebSocket");
            setIsConnected(false);
        });

        socketRef.current = socket;
    }, [selectedWallet, selectedContact, confirmedContacts, isAuthenticated]);

    // ✅ **Gestionar WebRTC solo si el usuario tiene un contacto confirmado**
    const { messages, sendMessage } = useWebRTC(selectedContact, selectedWallet);

    // ✅ **Mantener scroll en el último mensaje recibido**
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // ✅ **Cargar contactos al inicio SOLO si el usuario está autenticado**
    useEffect(() => {
        if (isAuthenticated) {
            fetchContacts();
        }
    }, [fetchContacts, isAuthenticated]);

    // ✅ **Inicializar WebSocket cuando cambie `selectedContact`**
    useEffect(() => {
        if (isAuthenticated && selectedContact) {
            initializeSocket();
        }
        return () => {
            if (socketRef.current) {
                console.log("🔴 Desconectando WebSocket...");
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [initializeSocket, selectedContact, isAuthenticated]);

    // ✅ **Manejo de la interacción de usuario (login automático si es necesario)**
    const handleUserInteraction = (action) => {
        if (!isAuthenticated) {
            console.warn("🚨 Intento de interactuar sin autenticación. Activando login...");
            handleLoginResponse(() => {
                console.log("✅ Autenticado, ejecutando acción...");
                action();
            });
            return;
        }
        action();
    };

    return (
        <>
            {/* ✅ Header flotante */}
            <header className="chat-header">
                {selectedContact ? (
                    <h3>
                        💬 Chat with:{" "}
                        <span title={selectedContact}>
                            {selectedContact.slice(0, 6)}...{selectedContact.slice(-4)}
                        </span>
                    </h3>
                ) : (
                    <h3 className="chat-header-placeholder">💬 Select a contact</h3>
                )}
                <p className={`connection-status ${isConnected ? "connected" : "disconnected"}`}>
                    {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
                </p>
            </header>

            {/* ✅ Cuerpo del chat sin fondo */}
            <main className="chat-messages" ref={chatContainerRef}>
                {selectedContact ? (
                    messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.sender === "me" ? "sent" : "received"}`}>
                                {msg.text}
                            </div>
                        ))
                    ) : (
                        <p className="no-messages">🔹 No messages yet.</p>
                    )
                ) : (
                    <p className="chat-placeholder">🔍 Select a contact to start chatting.</p>
                )}
            </main>

            {/* ✅ ChatInput correctamente ubicado */}
            <div className="writting-panel-container">
                <WrittingPanel onSendMessage={(message) => handleUserInteraction(() => sendMessage(message))} disabled={!isConnected} />
            </div>
        </>
    );
}

export default ChatWindow;
