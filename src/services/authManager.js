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

/**
 * 🔎 Llama al backend para comprobar si ya estamos autenticados.
 * Devuelve true si estamos autenticados, false si no.
 */
const checkAuthStatus = async () => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/status`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (!res.ok) {
      console.warn("⚠️ /status respondió error:", res.status);
      return false;
    }
    const data = await res.json();
    if (data.isAuthenticated) {
      console.log("✅ Backend confirma sesión activa:", data.wallet);
      internalState.walletAuthed = true;
      internalState.jwtValid = true;
      return true;
    } else {
      console.warn("🚫 Backend dice que NO estás autenticado.");
      return false;
    }
  } catch (err) {
    console.error("❌ Error comprobando /status:", err);
    return false;
  }
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
  
    // ✅ NUEVO → check de lastAuthCheck
    const lastCheck = localStorage.getItem('lastAuthCheck');
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
      const isAuthed = await checkAuthStatus();
  
      if (!isAuthed) {
        console.log("✍️ No autenticado → Ejecutando authenticateWallet()...");
        const result = await authenticateWallet();
        if (result?.status !== "authenticated") {
          console.warn("❌ Autenticación fallida.");
          return;
        }
        internalState.walletAuthed = true;
        internalState.jwtValid = true;
        localStorage.setItem('lastAuthCheck', Date.now());
        await syncAuthStatus();
      } else {
        localStorage.setItem('lastAuthCheck', Date.now());
      }
    }
  
    if (!internalState.jwtValid) {
      console.log("♻️ JWT caducado → Renovando...");
      const refreshed = await renewToken();
      internalState.jwtValid = !!refreshed;
      if (refreshed) {
        localStorage.setItem('lastAuthCheck', Date.now());
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
