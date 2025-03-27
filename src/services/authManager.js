// /services/authManager.js
import { useState, useEffect } from "react";
import { useServer } from "../contexts/ServerContext";
import { detectWallet } from "./walletStateService"; // ✅ Solo la detección real
import { getCSRFTokenFromCookie } from "./tokenService"; // ✅ Solo para lectura JWT

let internalState = {
  walletConnected: false,
  walletAuthed: false,
  jwtValid: false,
};

export const useAuthManager = () => {
  const { isAuthenticated } = useServer();
  const [isLoading, setIsLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);

  // Detecta y guarda la wallet actual (al montar)
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

  // Solo mantiene estado base (aún sin acción de login)
  const initState = async () => {
    const { pubkey } = await detectWallet();
    internalState.walletConnected = !!pubkey;
    internalState.walletAuthed = false;
    internalState.jwtValid = !!getCSRFTokenFromCookie();
  };

  return {
    isAuthenticated,
    isLoading,
    requiresLogin,
    selectedWallet,
    initState, // Por si lo quieres usar desde fuera en pruebas
  };
};
