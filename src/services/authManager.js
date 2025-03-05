import { useState, useEffect } from "react";
import { checkAuthStatus, refreshToken } from "./apiService";
import { useWallet } from "../contexts/WalletContext";
import { getConnectedWallet } from "../services/walletService";

export const useAuthManager = () => {
  const { walletAddress, setWalletAddress } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false); // 🔹 Indica si el usuario debe autenticarse
  const [selectedWallet, setSelectedWallet] = useState(null); // 🔹 Guarda la wallet conectada

  // ✅ **Detectar wallet conectada al abrir la web**
  useEffect(() => {
    const detectWallet = async () => {
      console.log("🔄 Revisando conexión automática...");
      const { walletAddress, selectedWallet } = await getConnectedWallet();

      if (walletAddress) {
        console.log(`✅ Wallet detectada automáticamente: ${selectedWallet} (${walletAddress})`);
        setWalletAddress(walletAddress);
        setSelectedWallet(selectedWallet);
        setRequiresLogin(false);
      } else {
        console.warn("⚠️ Ninguna wallet conectada, se requiere login.");
        setRequiresLogin(true);
      }
    };

    detectWallet();
  }, []);

  // ✅ **Comprobar autenticación cuando cambia la wallet**
  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true);
      try {
        if (!walletAddress) {
          setIsAuthenticated(false);
          setRequiresLogin(true);
          return;
        }

        const status = await checkAuthStatus();
        setIsAuthenticated(status.isAuthenticated);
        setRequiresLogin(!status.isAuthenticated);
      } catch (error) {
        console.error("❌ Error al verificar autenticación:", error);
        setIsAuthenticated(false);
        setRequiresLogin(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [walletAddress]);

  // ✅ **Actualizar estado en tiempo real con eventos de conexión**
  useEffect(() => {
    const handleWalletConnected = async () => {
      console.log("🔄 Evento walletConnected detectado. Verificando estado...");
      const { walletAddress, selectedWallet } = await getConnectedWallet();

      if (walletAddress) {
        console.log(`✅ Wallet conectada: ${selectedWallet} (${walletAddress})`);
        setWalletAddress(walletAddress);
        setSelectedWallet(selectedWallet);
        setRequiresLogin(false);
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

  // ✅ **Renovar el token de seguridad si está expirado**
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

  // ✅ **Manejo de respuesta al intentar realizar una acción protegida**
  const handleLoginResponse = async (action) => {
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
    action(); // ✅ Si ya está autenticado y con token válido, ejecutamos la acción
  };

  return {
    isAuthenticated,
    isLoading,
    requiresLogin,
    selectedWallet, // 🔹 Indica qué wallet está conectada
    handleLoginResponse,
  };
};
