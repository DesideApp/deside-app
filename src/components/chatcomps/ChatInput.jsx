import React, { useState, useRef, useEffect } from "react";
import "./ChatInput.css";

function ChatInput({ onSendMessage, disabled }) {
    const [message, setMessage] = useState("");
    const [authWarning, setAuthWarning] = useState(false);
    const inputRef = useRef(null);

    const handleSendMessage = () => {
        if (message.trim() === "" || disabled) return;
        onSendMessage(message);
        setMessage(""); // Limpiar input después de enviar
        inputRef.current.focus(); // Mantener el focus en el input
    };

    const handleKeyDown = (event) => {
        if (disabled && !authWarning) {
            // Mostrar aviso si intenta escribir sin autenticarse
            setAuthWarning(true);
            setTimeout(() => setAuthWarning(false), 3000); // Desaparece tras 3 segundos
        }

        if (event.key === "Enter" && !event.shiftKey && !disabled) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    useEffect(() => {
        if (!disabled) {
            setAuthWarning(false); // Ocultar el mensaje si el usuario se autentica
        }
    }, [disabled]);

    return (
        <div className="chat-input-container">
            <input
                ref={inputRef}
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
            />
            <button
                className="send-button"
                onClick={handleSendMessage}
                aria-label="Send Message"
                disabled={disabled}
            >
                Send
            </button>

            {/* 🔔 Aviso suave de autenticación */}
            {authWarning && (
                <p className="auth-warning">⚠️ Inicia sesión para enviar mensajes.</p>
            )}
        </div>
    );
}

export default ChatInput;
