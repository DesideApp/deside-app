// /services/authManager.js

import { useState, useEffect } from "react";
import { useServer } from "../contexts/ServerContext";

import { detectWallet } from "./walletStateService"; // ✅ Solo detección
import {
  getCSRFTokenFromCookie,
  refreshToken as renewToken,
} from "./tokenService"; // ✅ JWT lectura + refresh
import { connectWallet } from "./walletService"; // ✅ Conexión modal
import { authenticateWallet } from "./authService"; // ✅ Firma + login backend

let internalState = {
  walletConnected: false,
  walletAuthed: false,
  jwtValid: false,
};

export const useAuthManager = () => {
  const { isAuthenticated, syncAuthStatus } = useServer();

  const [isLoading, setIsLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);

  // 📡 Detecta wallet al montar
  const updateWalletState = async () => {
    const { pubkey } = await detectWallet();
    setSelectedWallet(pubkey);
  };

  useEffect(() => {
    updateWalletState().finally(() => {
      setIsLoading(false);
    });
  }, []);

  // 🔄 Escucha cambios de wallet (por ejemplo, si el usuario cambia de cuenta)
  useEffect(() => {
    const updateWallet = async () => {
      const { pubkey } = await detectWallet();
      setSelectedWallet(pubkey);
    };

    window.addEventListener("walletChanged", updateWallet);
    return () => {
      window.removeEventListener("walletChanged", updateWallet);
    };
  }, []);

  // 🔐 Estado de login en contexto global
  useEffect(() => {
    setRequiresLogin(!isAuthenticated);
  }, [isAuthenticated]);

  // 🔍 Inicializa estado interno
  const initState = async () => {
    const { pubkey } = await detectWallet();

    internalState.walletConnected = !!pubkey;
    internalState.walletAuthed = false;
    internalState.jwtValid = !!getCSRFTokenFromCookie();
  };

  // 🚀 Flujo completo de autenticación
  const ensureReady = async (action) => {
    await initState();

    if (!internalState.walletConnected) {
      console.log("🔌 No conectado → Conectando wallet...");
      const result = await connectWallet();

      if (!result?.pubkey) return;

      await initState();
    }

    if (!internalState.walletAuthed) {
      console.log("✍️ No autenticado → Ejecutando authenticateWallet()...");

      const result = await authenticateWallet();

      if (result?.status !== "authenticated") {
        console.warn("❌ Autenticación fallida.");
        return;
      }

      internalState.walletAuthed = true;
      internalState.jwtValid = true;

      await syncAuthStatus();
    }

    if (!internalState.jwtValid) {
      console.log("♻️ JWT caducado → Renovando...");

      const refreshed = await renewToken();

      internalState.jwtValid = !!refreshed;

      if (refreshed) {
        await syncAuthStatus();
      }
    }

    if (
      internalState.walletConnected &&
      internalState.walletAuthed &&
      internalState.jwtValid
    ) {
      console.log("✅ Autenticación completa. Ejecutando acción...");

      if (typeof action === "function") {
        action(); // ✅ Ejecuta la acción segura
      } else {
        console.warn("⚠️ Acción no válida en ensureReady:", action);
      }
    } else {
      console.warn("⚠️ No se pudo completar el flujo de autenticación.");
    }
  };

  return {
    isAuthenticated,
    isLoading,
    requiresLogin,
    selectedWallet,
    ensureReady,
  };
};
