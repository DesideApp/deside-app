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
          setRequiresLogin(true); // 🔹 Si no hay wallet, forzar login
          return;
        }

        const status = await checkAuthStatus();
        setIsAuthenticated(status.isAuthenticated);
        setRequiresLogin(!status.isAuthenticated); // 🔹 Solo forzar login si no está autenticado

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
    requiresLogin, // 🔹 Permite a los componentes saber si deben mostrar login
    handleLoginResponse,
  };
};
