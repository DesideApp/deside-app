import { useState, useEffect } from "react";
import { useServer } from "../contexts/ServerContext";

import { detectWallet } from "./walletStateService";
import {
  getCSRFTokenFromCookie,
  refreshToken as renewToken,
} from "./tokenService";
import { connectWallet, isExplicitLogout } from "./walletService";
import { authenticateWallet } from "./authService";
import { checkAuthStatus } from "./apiService";

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

      if (!pubkey) {
        console.log("🔴 Wallet desconectada → limpiando estado.");
        sessionStorage.removeItem("lastAuthCheck");
        internalState.walletConnected = false;
        internalState.walletAuthed = false;
        internalState.jwtValid = false;
        setRequiresLogin(true);
        return;
      }

      // 👂 Reintenta flujo si venimos de logout explícito
      if (isExplicitLogout()) {
        console.log("🔁 Reintentando login post-logout...");
        ensureReady();
      }
    };

    window.addEventListener("walletChanged", updateWallet);
    return () => window.removeEventListener("walletChanged", updateWallet);
  }, []);

  // 🔐 Estado global de login
  useEffect(() => {
    setRequiresLogin(!isAuthenticated);
  }, [isAuthenticated]);

  const initState = async () => {
    const { pubkey } = await detectWallet();
    internalState.walletConnected = !!pubkey;
    internalState.walletAuthed = false;
    internalState.jwtValid = !!getCSRFTokenFromCookie();
  };

  const ensureReady = async (action) => {
    console.log("🔎 ensureReady fue llamado con:", action);

    if (isExplicitLogout()) {
      console.warn("🚫 Logout explícito detectado → mostrando modal de wallet...");
      window.dispatchEvent(new Event("openWalletModal"));
      return;
    }

    await initState();

    if (!internalState.walletConnected) {
      console.log("🔌 No conectado → Conectando wallet...");
      const result = await connectWallet();
      if (!result?.pubkey) return;
      await initState();
    }

    const lastCheck = sessionStorage.getItem("lastAuthCheck");
    if (lastCheck && Date.now() - lastCheck < 30 * 60 * 1000) {
      console.log("✅ Omitiendo consulta a /status → sesión reciente.");
      internalState.walletAuthed = true;
      internalState.jwtValid = true;
      if (typeof action === "function") {
        try {
          action();
        } catch (err) {
          console.error("❌ Error ejecutando action():", err);
        }
      }
      return;
    }

    if (!internalState.walletAuthed) {
      console.log("🔎 Consultando backend para ver si ya estamos autenticados...");
      const result = await checkAuthStatus();

      if (!result?.isAuthenticated) {
        console.log("✍️ No autenticado → Ejecutando authenticateWallet()...");
        const authResult = await authenticateWallet();
        if (authResult?.status !== "authenticated") {
          console.warn("❌ Autenticación fallida.");
          return;
        }
        internalState.walletAuthed = true;
        internalState.jwtValid = true;
        sessionStorage.setItem("lastAuthCheck", Date.now());
        await syncAuthStatus();
      } else {
        internalState.walletAuthed = true;
        internalState.jwtValid = true;
        sessionStorage.setItem("lastAuthCheck", Date.now());
      }
    }

    if (!internalState.jwtValid) {
      console.log("♻️ JWT caducado → Renovando...");
      const refreshed = await renewToken();
      internalState.jwtValid = !!refreshed;
      if (refreshed) {
        sessionStorage.setItem("lastAuthCheck", Date.now());
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
        try {
          action();
        } catch (err) {
          console.error("❌ Error ejecutando action():", err);
        }
      } else if (action !== undefined) {
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
