import React, { useEffect, useRef, useState, useCallback } from "react";
import WrittingPanel from "./WrittingPanel";
import ChatMessages from "./ChatMessages";
import useWebRTC from "../../hooks/useWebRTC";
import { io } from "socket.io-client";
import useBackupManager from "../../hooks/useBackupManager";
import { notify } from "../../services/notificationService.js";
import "./ChatWindow.css";

function ChatWindow({ selectedContact }) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [historyMessages, setHistoryMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const {
    messages: liveMessages,
    sendMessage,
    sendSignal,
    handleRemoteSignal
  } = useWebRTC(selectedContact);

  const { loadChat } = useBackupManager();

  /**
   * ✅ Merge messages intelligently
   */
  const mergeMessages = (history, live) => {
    const seen = new Set();
    const combined = [...history, ...live].filter((msg) => {
      const key = msg.id || JSON.stringify(msg);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return combined.sort((a, b) => {
      const tA = new Date(a.timestamp || 0).getTime();
      const tB = new Date(b.timestamp || 0).getTime();
      return tA - tB;
    });
  };

  // ✅ Load chat history when a contact is selected
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedContact) {
        setHistoryMessages([]);
        return;
      }

      setLoadingHistory(true);

      try {
        console.log("🔹 Loading chat history from BackupManager:", selectedContact);
        const history = await loadChat(selectedContact);
        console.log("✅ History loaded:", history);
        setHistoryMessages(history || []);
      } catch (error) {
        console.error("❌ Error loading chat history:", error);
        notify("Error loading chat history.", "error");
        setHistoryMessages([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [selectedContact, loadChat]);

  const allMessages = mergeMessages(historyMessages, liveMessages);

  // ✅ Inicializar WebSocket solo si hay contacto seleccionado
  const initializeSocket = useCallback(() => {
    if (!selectedContact) return;

    if (socketRef.current) {
      console.log("⚡ WebSocket ya está conectado, evitando reconexión.");
      return;
    }

    console.log("🔵 Conectando a WebSocket...");
    setIsConnecting(true);

    const socket = io(import.meta.env.VITE_WEBSOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("🟢 Conectado al servidor WebSocket");
      setIsConnected(true);
      setIsConnecting(false);

      // ✅ Registramos la wallet solo si está conectado
      if (socket.connected) {
        socket.emit("register_wallet", selectedContact);
      }
    });

    socket.on("disconnect", () => {
      console.warn("🔴 Desconectado del servidor WebSocket");
      setIsConnected(false);
      setIsConnecting(false);
      notify("Disconnected from chat server.", "error");
    });

    socket.on("webrtc_signal", ({ from, signal }) => {
      console.log("📡 Señal WebRTC recibida de:", from, signal);
      handleRemoteSignal(signal);
    });

    socketRef.current = socket;
  }, [selectedContact, handleRemoteSignal]);

  const emitSignal = (signal) => {
    if (socketRef.current && selectedContact && socketRef.current.connected) {
      console.log("📤 Enviando señal WebRTC a:", selectedContact, signal);
      socketRef.current.emit("webrtc_signal", {
        to: selectedContact,
        signal,
      });
    } else {
      console.warn("❌ Socket not connected. Cannot send signal.");
      notify("Connection lost. Cannot send signal.", "error");
    }
  };

  useEffect(() => {
    if (selectedContact) {
      initializeSocket();
    }

    return () => {
      if (socketRef.current) {
        console.log("🔴 Desconectando WebSocket...");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [initializeSocket, selectedContact]);

  useEffect(() => {
    if (!selectedContact) return;
    sendSignal.current = emitSignal;
  }, [selectedContact]);

  return (
    <>
      <header className="chat-header">
        {selectedContact ? (
          <h3>
            💬 Chat with:{" "}
            <span title={selectedContact}>
              {selectedContact.slice(0, 6)}...{selectedContact.slice(-4)}
            </span>
          </h3>
        ) : (
          <h3 className="chat-header-placeholder">
            💬 Select a contact
          </h3>
        )}
        <p
          className={`connection-status ${
            isConnected
              ? "connected"
              : isConnecting
              ? "connecting"
              : "disconnected"
          }`}
        >
          {isConnected
            ? "🟢 Connected"
            : isConnecting
            ? "🟡 Connecting..."
            : "🔴 Disconnected"}
        </p>
      </header>

      {loadingHistory && (
        <div className="loading-history text-gray-500 text-sm">
          Loading chat history...
        </div>
      )}

      <ChatMessages
        messages={allMessages}
        selectedContact={selectedContact}
      />

      <div className="writting-panel-container">
        <WrittingPanel
          onSendMessage={sendMessage}
          disabled={!isConnected}
        />
      </div>
    </>
  );
}

export default ChatWindow;
