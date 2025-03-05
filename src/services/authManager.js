import { useState, useEffect } from "react";
import { checkAuthStatus, refreshToken } from "./apiService";
import { useWallet } from "../contexts/WalletContext";

export const useAuthManager = () => {
  const { walletAddress } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false); // 🔹 Estado para indicar si el usuario debe autenticarse

  // ✅ **Comprobar autenticación cuando cambia la wallet**
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

        // 🚨 Si el usuario no está autenticado, marcamos que necesita autenticación
        if (!status.isAuthenticated) {
          setRequiresLogin(true);
        }
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

  // ✅ **Manejo de respuesta al intentar realizar una acción protegida**
  const handleLoginResponse = async (action) => {
    if (!walletAddress) {
      console.warn("🚨 Usuario no conectado.");
      setRequiresLogin(true); // 🔹 Activar el estado para que el frontend muestre el modal
      return;
    }

    if (!isAuthenticated) {
      console.warn("🚨 Usuario no autenticado. Requiere firma.");
      setRequiresLogin(true);
      return;
    }

    // Si el token está expirado, intentamos renovarlo
    await renewToken();

    // ✅ Si ya está autenticado y con token válido, ejecutamos la acción
    action();
  };

  return {
    isAuthenticated,
    isLoading,
    requiresLogin, // 🔹 Nuevo estado que puede ser leído por otros componentes
    handleLoginResponse,
  };
};
