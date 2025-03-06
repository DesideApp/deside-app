import { useState, useEffect } from "react";
import { checkAuthStatus, refreshToken } from "./apiService";
import { useServer } from "../contexts/ServerContext"; // ✅ Importamos correctamente el contexto
import { getConnectedWallet } from "../services/walletService";

export const useAuthManager = () => {
  const { isAuthenticated, syncAuthStatus } = useServer(); // ✅ Nuevo uso del contexto
  const [isLoading, setIsLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null); // 🔹 Guarda la wallet conectada

  // ✅ **Detectar wallet conectada al abrir la web**
  useEffect(() => {
    const detectWallet = async () => {
      console.log("🔄 Revisando conexión automática...");
      const { walletAddress, selectedWallet } = await getConnectedWallet();

      if (walletAddress) {
        console.log(`✅ Wallet detectada automáticamente: ${selectedWallet} (${walletAddress})`);
        setSelectedWallet(selectedWallet);
        setRequiresLogin(false);
      } else {
        console.warn("⚠️ Ninguna wallet conectada, se requiere login.");
        setRequiresLogin(true);
      }
    };

    detectWallet();
  }, []);

  // ✅ **Verificar autenticación cuando cambia el estado global del servidor**
  useEffect(() => {
    setIsLoading(true);
    if (!isAuthenticated) {
      setRequiresLogin(true);
    } else {
      setRequiresLogin(false);
    }
    setIsLoading(false);
  }, [isAuthenticated]);

  // ✅ **Renovar el token de seguridad si está expirado**
  const renewToken = async () => {
    try {
      const response = await refreshToken();
      if (response) {
        console.log("✅ Token renovado correctamente");
        await syncAuthStatus(); // ✅ Sincroniza con el servidor
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
