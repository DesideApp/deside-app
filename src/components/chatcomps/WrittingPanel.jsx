import React, { useState, useRef, useEffect, useCallback } from "react";
import { signTextMessage } from "../../services/signService";
import { notify } from "../../services/notificationService.js";
import "./WrittingPanel.css";

const MAX_LENGTH = 500;

const WrittingPanel = React.memo(
  ({ onSendMessage, disabled, openAuthModal }) => {
    const [message, setMessage] = useState("");
    const [authWarning, setAuthWarning] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const inputRef = useRef(null);

    // ✅ Ajustar altura dinámica
    const adjustHeight = () => {
      if (inputRef.current) {
        inputRef.current.style.height = "40px";
        inputRef.current.style.height = `${Math.min(
          inputRef.current.scrollHeight,
          120
        )}px`;
      }
    };

    const handleSendMessage = useCallback(async () => {
      const trimmedMessage = message.trim();
      if (!trimmedMessage || disabled) return;

      if (trimmedMessage.length > MAX_LENGTH) {
        notify(`Message exceeds maximum length of ${MAX_LENGTH} characters.`, "error");
        return;
      }

      try {
        const signature = await signTextMessage(trimmedMessage);

        const messageObject = {
          text: trimmedMessage,
          signature,
          isSigned: true,
          isBackedUp: false,
          isEncrypted: false,
        };

        onSendMessage(messageObject);

        setMessage("");
        setCharCount(0);
        inputRef.current.style.height = "40px";
        inputRef.current?.focus();
      } catch (error) {
        console.error("❌ Error al firmar el mensaje:", error);
        notify("Error signing message. Check your wallet.", "error");
      }
    }, [message, disabled, onSendMessage]);

    const handleKeyDown = useCallback(
      (event) => {
        if (
          (event.key === "Enter" && !event.shiftKey) ||
          (event.key === "Enter" && event.ctrlKey)
        ) {
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

    useEffect(() => {
      if (!disabled) setAuthWarning(false);
    }, [disabled]);

    const handleChange = (e) => {
      const text = e.target.value;
      if (text.length <= MAX_LENGTH) {
        setMessage(text);
        setCharCount(text.length);
        adjustHeight();
      }
    };

    const handleClear = () => {
      setMessage("");
      setCharCount(0);
      inputRef.current.style.height = "40px";
      inputRef.current?.focus();
    };

    const charClass =
      charCount > MAX_LENGTH * 0.9
        ? "char-count-warning"
        : "char-count-normal";

    return (
      <>
        <div className="writting-panel-wrapper">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Escribe un mensaje..."
            value={message}
            onChange={handleChange}
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
            disabled={
              disabled || !message.trim() || message.length > MAX_LENGTH
            }
          >
            ➤
          </button>
          <span className={`char-count ${charClass}`}>
            {charCount} / {MAX_LENGTH}
          </span>
          {message && (
            <button
              className="clear-button"
              onClick={handleClear}
              aria-label="Clear message input"
            >
              ✖
            </button>
          )}
        </div>

        {authWarning && (
          <p className="auth-warning animate-bounce">
            ⚠️ Debes iniciar sesión para enviar mensajes.
          </p>
        )}
      </>
    );
  }
);

export default WrittingPanel;
