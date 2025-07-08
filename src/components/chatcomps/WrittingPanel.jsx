import React, { useState, useRef, useEffect, useCallback } from "react";
import { signTextMessage } from "../../services/signService";
import "./WrittingPanel.css";

const WrittingPanel = React.memo(({ onSendMessage, disabled, openAuthModal }) => {
  const [message, setMessage] = useState("");
  const [authWarning, setAuthWarning] = useState(false);
  const inputRef = useRef(null);

  // ✅ Ajustar altura dinámica
  const adjustHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "40px";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  };

  // ✅ Enviar mensaje solo si el input no está vacío y no está deshabilitado
  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    try {
      // ✅ Firmar el mensaje
      const signature = await signTextMessage(trimmedMessage);

      // ✅ Preparar objeto con flags
      const messageObject = {
        text: trimmedMessage,
        signature,
        isSigned: true,
        isBackedUp: false,     // por ahora false → lo implementarás después
        isEncrypted: false,    // futuro
      };

      // ✅ Enviar objeto al handler
      onSendMessage(messageObject);

      setMessage("");
      inputRef.current.style.height = "40px";
      inputRef.current?.focus();
    } catch (error) {
      console.error("❌ Error al firmar el mensaje:", error);
      alert("Error al firmar el mensaje. Verifica tu wallet.");
    }
  }, [message, disabled, onSendMessage]);

  // ✅ Manejo de la tecla "Enter"
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (disabled) {
          setAuthWarning(true);
          setTimeout(() => setAuthWarning(false), 3000);
          openAuthModal();
        } else {
          handleSendMessage();
        }
      }
    },
    [disabled, handleSendMessage, openAuthModal]
  );

  // ✅ Ocultar mensaje de advertencia al habilitar el input
  useEffect(() => {
    if (!disabled) setAuthWarning(false);
  }, [disabled]);

  return (
    <>
      <textarea
        ref={inputRef}
        className="chat-input"
        placeholder="Escribe un mensaje..."
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          adjustHeight();
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-disabled={disabled}
        aria-label="Campo de entrada para escribir mensajes"
        rows="1"
      />
      <button
        className="send-button"
        onClick={handleSendMessage}
        aria-label="Enviar mensaje"
        disabled={disabled}
      >
        ➤
      </button>

      {authWarning && (
        <p className="auth-warning">
          ⚠️ Debes iniciar sesión para enviar mensajes.
        </p>
      )}
    </>
  );
});

export default WrittingPanel;
