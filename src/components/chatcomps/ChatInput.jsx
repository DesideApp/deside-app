import React, { useState, useRef, useEffect, useCallback } from "react";
import "./ChatInput.css";

const ChatInput = React.memo(({ onSendMessage, disabled }) => {
    const [message, setMessage] = useState("");
    const [authWarning, setAuthWarning] = useState(false);
    const inputRef = useRef(null);

    // ✅ **Enviar mensaje solo si el input no está vacío y no está deshabilitado**
    const handleSendMessage = useCallback(() => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage || disabled) return;

        onSendMessage(trimmedMessage);
        setMessage(""); // ✅ Limpia el input tras enviar el mensaje
        inputRef.current?.focus(); // ✅ Mantiene el foco en el input
    }, [message, disabled, onSendMessage]);

    // ✅ **Manejo de la tecla "Enter"**
    const handleKeyDown = useCallback(
        (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (disabled) {
                    setAuthWarning(true);
                    setTimeout(() => setAuthWarning(false), 3000);
                } else {
                    handleSendMessage();
                }
            }
        },
        [disabled, handleSendMessage]
    );

    // ✅ **Ocultar mensaje de advertencia al habilitar el input**
    useEffect(() => {
        if (!disabled) setAuthWarning(false);
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
                aria-disabled={disabled}
                aria-label="Campo de entrada para escribir mensajes"
            />
            <button
                className="send-button"
                onClick={handleSendMessage}
                aria-label="Enviar mensaje"
                disabled={disabled}
            >
                ➤
            </button>

            {/* 🔔 Aviso de autenticación */}
            {authWarning && (
                <p className="auth-warning">⚠️ Debes estar autenticado para enviar mensajes.</p>
            )}
        </div>
    );
});

export default ChatInput;
