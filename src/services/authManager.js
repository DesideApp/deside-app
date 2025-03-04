import { useState, useEffect } from "react";
import { checkAuthStatus, refreshToken } from "./apiService"; // Funciones ya implementadas
import { useWallet } from "../contexts/WalletContext"; // Para obtener el estado de la wallet
import { getProvider } from "./walletProviders"; // Para obtener el proveedor de la wallet

export const useAuthManager = () => {
  const { walletAddress } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ **Comprobar el estado de autenticación cuando cambia la wallet**
  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true);
      try {
        if (!walletAddress) {
          setIsAuthenticated(false);
          return;
        }

        const status = await checkAuthStatus();
        setIsAuthenticated(status.isAuthenticated);
      } catch (error) {
        console.error("❌ Error al verificar autenticación:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (walletAddress) {
      checkAuthentication();
    } else {
      setIsLoading(false);
    }
  }, [walletAddress]);

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

  // ✅ **Manejo del login de acuerdo al estado de la wallet y autenticación**
  const handleLoginResponse = async (action) => {
    if (!walletAddress) {
      console.log("🚨 Usuario no conectado. Pidiendo conexión...");
      // Si no está conectado, mostramos el modal de conexión
      // Llama a abrir el modal de conexión aquí
      return;
    }

    if (!isAuthenticated) {
      console.log("🚨 Usuario no autenticado. Iniciando autenticación...");
      // Si no está autenticado, pedimos la firma
      const provider = getProvider("phantom"); // O el proveedor conectado
      if (provider) {
        await provider.signMessage("Please sign this message to authenticate.");
      }
      return;
    }

    // Si el token está expirado, lo renovamos
    if (isAuthenticated) {
      await renewToken();
    }

    // Si está autenticado y el token es válido, ejecutamos la acción
    action();
  };

  return {
    isAuthenticated,
    isLoading,
    handleLoginResponse,
  };
};
