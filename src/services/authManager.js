import { useState, useEffect } from "react";
import { refreshToken } from "./apiService";
import { useServer } from "../contexts/ServerContext"; // ✅ Estado global de autenticación
import { getConnectedWallet } from "../services/walletService";

export const useAuthManager = () => {
  const { isAuthenticated, syncAuthStatus } = useServer();
  const [isLoading, setIsLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null); // 🔹 Wallet conectada en tiempo real

  // ✅ **Detectar wallet conectada al abrir la web**
  useEffect(() => {
    const detectWallet = async () => {
      console.log("🔄 Revisando conexión automática...");
      const { walletAddress, selectedWallet } = await getConnectedWallet();
      setSelectedWallet(walletAddress || null);
    };

    detectWallet().finally(() => setIsLoading(false)); // 🔥 No bloquea UI
  }, []);

  // ✅ **Escuchar cambios en la wallet conectada**
  useEffect(() => {
    const updateWallet = async () => {
      const { walletAddress, selectedWallet } = await getConnectedWallet();
      setSelectedWallet(walletAddress || null);
    };

    window.addEventListener("walletChanged", updateWallet);
    return () => window.removeEventListener("walletChanged", updateWallet);
  }, []);

  // ✅ **Verificar autenticación cuando cambia el estado global del servidor**
  useEffect(() => {
    if (!isAuthenticated) {
      setRequiresLogin(true);
    } else {
      setRequiresLogin(false);
    }
  }, [isAuthenticated]);

  // ✅ **Renovar el token de seguridad si está expirado**
  const renewToken = async () => {
    try {
      const response = await refreshToken();
      if (response) {
        console.log("✅ Token renovado correctamente");
        await syncAuthStatus();
      } else {
        console.warn("⚠️ No se pudo renovar el token");
      }
    } catch (error) {
      console.error("❌ Error renovando token", error);
    }
  };

  // ✅ **Manejo de respuesta al intentar realizar una acción protegida**
  const handleLoginResponse = async (action) => {
    if (!isAuthenticated) {
      console.warn("🚨 Usuario no autenticado. Se requiere login.");
      setRequiresLogin(true);

      // ⏳ **Evitar múltiples intentos en pocos segundos**
      setTimeout(() => setRequiresLogin(false), 5000);
      return;
    }

    // 🔹 **Verificar y actualizar la wallet antes de continuar**
    const { walletAddress, selectedWallet } = await getConnectedWallet();
    setSelectedWallet(walletAddress || null);

    await renewToken();
    action();
  };

  return {
    isAuthenticated,
    isLoading,
    requiresLogin,
    selectedWallet, // 🔹 Ahora detecta cambios en tiempo real
    handleLoginResponse,
  };
};
