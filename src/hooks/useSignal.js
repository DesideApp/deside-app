import { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";
import { checkAuthStatus } from "../services/apiService.js";

const useSignal = ({
  backendUrl,
  onSignalReceived,
  onContactRequest,
  onContactAccepted,
}) => {
  const socket = useRef(null);
  const [connected, setConnected] = useState(false);

  /**
   * ✅ Inicializar WebSocket
   */
  const initializeSocket = useCallback(async () => {
    if (socket.current && socket.current.connected) {
      console.log("⚡ WebSocket ya conectado, evitando reconexión.");
      return;
    }

    try {
      const { isAuthenticated, wallet } = await checkAuthStatus();
      if (!isAuthenticated) {
        console.warn("⚠️ Usuario no autenticado. No se inicia la señalización.");
        return;
      }

      if (!socket.current) {
        socket.current = io(backendUrl, {
          autoConnect: false,
          reconnection: true,
          reconnectionAttempts: 5,
          transports: ["websocket"],
          withCredentials: true,
        });
      }

      socket.current.connect();

      socket.current.on("connect", () => {
        setConnected(true);
        console.log("✅ WebSocket conectado.");
        socket.current.emit("register_wallet", wallet);
      });

      socket.current.on("disconnect", () => {
        setConnected(false);
        console.warn("⚠️ WebSocket desconectado.");
      });

      /**
       * ✅ Señales WebRTC
       */
      socket.current.on("signal", (payload) => {
        console.log("📡 Señal WebRTC recibida:", payload);

        if (payload?.from && payload?.signal) {
          onSignalReceived?.(payload.from, payload.signal);
        } else {
          console.warn("⚠️ Señal recibida inválida:", payload);
        }
      });

      /**
       * ✅ Eventos de contactos
       */
      socket.current.on("contact_request", ({ from }) => {
        if (from) {
          console.log(`📨 Nueva solicitud de contacto de ${from}`);
          onContactRequest?.(from);
        }
      });

      socket.current.on("contact_accepted", ({ from }) => {
        if (from) {
          console.log(`✅ Contacto aceptado: ${from}`);
          onContactAccepted?.(from);
        }
      });
    } catch (error) {
      console.error("❌ Error inicializando WebSocket:", error);
    }
  }, [backendUrl, onSignalReceived, onContactRequest, onContactAccepted]);

  /**
   * ✅ Desconexión limpia
   */
  useEffect(() => {
    initializeSocket();

    return () => {
      if (socket.current) {
        console.log("🔴 Desconectando WebSocket...");
        socket.current.removeAllListeners();
        socket.current.disconnect();
      }
    };
  }, [initializeSocket]);

  /**
   * ✅ Métodos para emitir eventos
   */
  const sendSignal = (targetPubkey, signalData) => {
    if (!socket.current?.connected) {
      console.error("❌ No se puede enviar señal, socket no conectado.");
      return;
    }
    console.log(`📤 Enviando señal a ${targetPubkey}`, signalData);
    socket.current.emit("signal", {
      target: targetPubkey,
      signal: signalData,
    });
  };

  const sendContactRequest = (targetPubkey) => {
    if (!socket.current?.connected) {
      console.error("❌ No se puede enviar solicitud, socket no conectado.");
      return;
    }
    console.log(`📨 Enviando solicitud de contacto a ${targetPubkey}`);
    socket.current.emit("contact_request", { from: targetPubkey });
  };

  const notifyContactAccepted = (targetPubkey) => {
    if (!socket.current?.connected) {
      console.error("❌ No se puede notificar aceptación de contacto, socket no conectado.");
      return;
    }
    console.log(`✅ Notificando aceptación a ${targetPubkey}`);
    socket.current.emit("contact_accepted", { from: targetPubkey });
  };

  return {
    connected,
    sendSignal,
    sendContactRequest,
    notifyContactAccepted,
  };
};

export default useSignal;
