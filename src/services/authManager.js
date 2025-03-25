// /services/authManager.js
import { useState, useEffect } from "react";
import { useServer } from "../contexts/ServerContext";
import {
  detectWallet,
  hasSignedMessage,         // ✅ Función real que verifica autenticación por firma
  signMessageForLogin,
} from "./walletStateService";
import {
  getCSRFTokenFromCookie,
  refreshToken as callRefreshToken,
} from "./tokenService";
import { authenticateWithServer } from "./apiService";
import { connectWallet } from "./walletService";

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

  const updateWalletState = async () => {
    const { pubkey } = await detectWallet();
    setSelectedWallet(pubkey);
  };

  useEffect(() => {
    updateWalletState().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const updateWallet = async () => {
      const { pubkey } = await detectWallet();
      setSelectedWallet(pubkey);
    };

    window.addEventListener("walletChanged", updateWallet);
    return () => window.removeEventListener("walletChanged", updateWallet);
  }, []);

  useEffect(() => {
    setRequiresLogin(!isAuthenticated);
  }, [isAuthenticated]);

  const renewToken = async () => {
    const response = await callRefreshToken();
    if (response) {
      internalState.jwtValid = true;
      await syncAuthStatus();
    } else {
      console.warn("⚠️ Refresh token inválido.");
      internalState.jwtValid = false;
    }
  };

  const initState = async () => {
    const { pubkey } = await detectWallet();
    internalState.walletConnected = !!pubkey;
    internalState.walletAuthed = await hasSignedMessage(); // ✅ Aquí usamos la función real
    internalState.jwtValid = !!getCSRFTokenFromCookie();
  };

  const ensureReady = async (action) => {
    await initState();

    if (!internalState.walletConnected) {
      console.log("🔌 Wallet no conectada. Abriendo proveedor...");
      await connectWallet();
      await initState();
    }

    if (!internalState.walletAuthed) {
      console.log("✍️ Wallet conectada pero no autenticada. Solicitando firma...");
      const signed = await signMessageForLogin("Please sign this message to authenticate.");
      if (!signed?.signature) return;

      const result = await authenticateWithServer(signed.pubkey, signed.signature, signed.message);
      if (result?.nextStep !== "ACCESS_GRANTED") {
        console.warn("❌ Login backend fallido.");
        return;
      }

      internalState.walletAuthed = true;
      internalState.jwtValid = true;
      await syncAuthStatus();
    }

    if (!internalState.jwtValid) {
      console.log("♻️ JWT caducado. Refrescando...");
      await renewToken();
    }

    if (
      internalState.walletConnected &&
      internalState.walletAuthed &&
      internalState.jwtValid
    ) {
      console.log("✅ Autenticación completa. Ejecutando acción...");
      action();
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

// 🧩 Helper para envolver onClick en botones
export const withAuth = (action) => () => {
  if (typeof window.ensureReady === "function") {
    window.ensureReady(action);
  } else {
    console.warn("⚠️ ensureReady no está disponible.");
  }
};
