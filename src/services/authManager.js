// /services/authManager.js

import { useState, useEffect } from "react";
import { useServer } from "../contexts/ServerContext";

import { detectWallet } from "./walletStateService";
import {
  getCSRFTokenFromCookie,
  refreshToken as renewToken,
} from "./tokenService";
import { connectWallet, isExplicitLogout } from "./walletService";
import { authenticateWallet } from "./authService";

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
    updateWalletState().finally(() => setIsLoading(false));
  }, []);

  // 🔄 Escucha cambios de wallet
  useEffect(() => {
    const updateWallet = async () => {
      const { pubkey } = await detectWallet();
      setSelectedWallet(pubkey);

      // 👂 Reintenta flujo si venimos de logout explícito
      if (isExplicitLogout()) {
        console.log("🔁 Reintentando login post-logout...");
        ensureReady(); // sin acción, solo login
      }
    };

    window.addEventListener("walletChanged", updateWallet);
    return () => window.removeEventListener("walletChanged", updateWallet);
  }, []);

  // 🔐 Estado global de login
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

  // 🚀 Flujo principal
  const ensureReady = async (action) => {
    console.log("🔎 ensureReady fue llamado con:", action);

    if (isExplicitLogout()) {
      console.warn("🚫 Logout explícito detectado → mostrando modal de wallet...");
      window.dispatchEvent(new Event("openWalletModal")); // Solo visual
      return;
    }

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
      if (refreshed) await syncAuthStatus();
    }

    if (
      internalState.walletConnected &&
      internalState.walletAuthed &&
      internalState.jwtValid
    ) {
      console.log("✅ Autenticación completa. Ejecutando acción...");
      if (typeof action === "function") {
        try {
          action();
        } catch (err) {
          console.error("❌ Error ejecutando action():", err);
        }
      } else {
        console.warn("⚠️ Acción inválida pasada a ensureReady:", action);
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
