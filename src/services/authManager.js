import { useState, useEffect } from "react";
import { checkAuthStatus, refreshToken } from "./apiService";
import { useServerContext } from "../contexts/ServerContext"; // ✅ Nuevo contexto
import { getConnectedWallet } from "../services/walletService";

export const useAuthManager = () => {
  const { walletAddress, setWalletAddress } = useServerContext(); // ✅ ServerContext maneja estado global
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false); 
  const [selectedWallet, setSelectedWallet] = useState(null); 

  // ✅ **Detectar wallet y verificar autenticación**
  useEffect(() => {
    const detectWalletAndAuth = async () => {
      console.log("🔄 Revisando conexión y autenticación...");
      const { walletAddress, selectedWallet } = await getConnectedWallet();

      if (walletAddress) {
        console.log(`✅ Wallet detectada: ${selectedWallet} (${walletAddress})`);
        setWalletAddress(walletAddress);
        setSelectedWallet(selectedWallet);

        const status = await checkAuthStatus();
        setIsAuthenticated(status.isAuthenticated);
        setRequiresLogin(!status.isAuthenticated);
      } else {
        console.warn("⚠️ Ninguna wallet conectada, se requiere login.");
        setRequiresLogin(true);
      }
      setIsLoading(false);
    };

    detectWalletAndAuth();
  }, []);

  // ✅ **Actualizar estado en tiempo real con eventos de conexión**
  useEffect(() => {
    const handleWalletConnected = async () => {
      console.log("🔄 Evento walletConnected detectado. Verificando estado...");
      const { walletAddress, selectedWallet } = await getConnectedWallet();

      if (walletAddress) {
        console.log(`✅ Wallet conectada: ${selectedWallet} (${walletAddress})`);
        setWalletAddress(walletAddress);
        setSelectedWallet(selectedWallet);

        const status = await checkAuthStatus();
        setIsAuthenticated(status.isAuthenticated);
        setRequiresLogin(!status.isAuthenticated);
      }
    };

    const handleWalletDisconnected = () => {
      console.warn("❌ Wallet desconectada.");
      setWalletAddress(null);
      setSelectedWallet(null);
      setIsAuthenticated(false);
      setRequiresLogin(true);
    };

    window.addEventListener("walletConnected", handleWalletConnected);
    window.addEventListener("walletDisconnected", handleWalletDisconnected);

    return () => {
      window.removeEventListener("walletConnected", handleWalletConnected);
      window.removeEventListener("walletDisconnected", handleWalletDisconnected);
    };
  }, []);

  // ✅ **Renovar token si está expirado**
  const renewToken = async () => {
    try {
      const response = await refreshToken();
      if (response) {
        console.log("✅ Token renovado correctamente");
      } else {
        console.warn("⚠️ No se pudo renovar el token");
      }
    } catch (error) {
      console.error("❌ Error renovando token", error);
    }
  };

  // ✅ **Manejo de autenticación automática**
  const handleLoginResponse = async () => {
    if (!walletAddress) {
      console.warn("🚨 Usuario no conectado. Se requiere login.");
      setRequiresLogin(true);
      return;
    }

    if (!isAuthenticated) {
      console.warn("🚨 Usuario no autenticado. Se requiere login.");
      setRequiresLogin(true);
      return;
    }

    await renewToken();
  };

  return {
    isAuthenticated,
    isLoading,
    requiresLogin,
    selectedWallet,
    handleLoginResponse,
  };
};
