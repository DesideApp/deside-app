import { useState, useEffect } from "react";
import { useServer } from "../contexts/ServerContext"; // Estado global de autenticación
import { detectWallet, handleWalletSelected } from "../services/walletStateService"; // Detección y actualización de wallet
import { refreshToken as callRefreshToken } from "../services/tokenService"; // Llamada a refreshToken desde tokenService.js

export const useAuthManager = () => {
  const { isAuthenticated, syncAuthStatus } = useServer();
  const [isLoading, setIsLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null); // Wallet conectada en tiempo real

  // Detectar wallet conectada al abrir la web y al hacer clic
  const updateWalletState = async () => {
    const { pubkey } = await detectWallet();
    setSelectedWallet(pubkey);
  };

  useEffect(() => {
    // Detectar wallet al iniciar
    updateWalletState().finally(() => setIsLoading(false));
  }, []);

  // Escuchar cambios en la wallet conectada
  useEffect(() => {
    const updateWallet = async () => {
      const { pubkey } = await detectWallet();
      setSelectedWallet(pubkey);
    };

    window.addEventListener("walletChanged", updateWallet);
    return () => window.removeEventListener("walletChanged", updateWallet);
  }, []);

  // Verificar autenticación cuando cambia el estado global del servidor
  useEffect(() => {
    setRequiresLogin(!isAuthenticated);
  }, [isAuthenticated]);

  // Renovar el token de seguridad si está expirado
  const renewToken = async () => {
    try {
      const response = await callRefreshToken(); // Llamada a refreshToken desde tokenService.js
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

  // Manejo de respuesta al intentar realizar una acción protegida
  const handleLoginResponse = async (action) => {
    if (!isAuthenticated) {
      console.warn("🚨 Usuario no autenticado. Se requiere login.");
      setRequiresLogin(true);

      // Evitar múltiples intentos en pocos segundos
      setTimeout(() => setRequiresLogin(false), 5000);
      return;
    }

    // Verificar si la wallet está conectada antes de proceder
    if (!selectedWallet) {
      console.warn("🚨 No hay wallet conectada.");
      return;
    }

    await renewToken(); // Renovamos el token si estamos autenticados
    action(); // Ejecutamos la acción protegida
  };

  return {
    isAuthenticated,
    isLoading,
    requiresLogin,
    selectedWallet, // Ahora detecta cambios en tiempo real
    handleLoginResponse,
  };
};
