import React, { useState, useRef, useEffect } from "react";
import "./ChatInput.css";

function ChatInput({ onSendMessage, disabled }) {
    const [message, setMessage] = useState("");
    const [authWarning, setAuthWarning] = useState(false);
    const inputRef = useRef(null);

    // ✅ **Enviar mensaje solo si no está deshabilitado y el input tiene texto**
    const handleSendMessage = () => {
        if (!message.trim() || disabled) return;
        onSendMessage(message.trim());
        setMessage(""); // ✅ Limpiar input después de enviar
        inputRef.current.focus(); // ✅ Mantener el focus en el input
    };

    // ✅ **Manejo de la tecla "Enter"**
    const handleKeyDown = (event) => {
        if (disabled) {
            setAuthWarning(true);
            setTimeout(() => setAuthWarning(false), 3000); // ✅ Ocultar el aviso tras 3 segundos
        }

        if (event.key === "Enter" && !event.shiftKey && !disabled) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    useEffect(() => {
        if (!disabled) setAuthWarning(false); // ✅ Ocultar el mensaje si el usuario se autentica
    }, [disabled]);

    return (
        <div className="chat-input-container">
            <input
                ref={inputRef}
                type="text"
                className="chat-input"
                placeholder="Escribe un mensaje..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
            />
            <button
                className="send-button"
                onClick={handleSendMessage}
                aria-label="Enviar mensaje"
                disabled={disabled}
            >
                Enviar
            </button>

            {/* 🔔 Aviso de autenticación */}
            {authWarning && (
                <p className="auth-warning">⚠️ Debes estar autenticado para enviar mensajes.</p>
            )}
        </div>
    );
}

export default ChatInput;
