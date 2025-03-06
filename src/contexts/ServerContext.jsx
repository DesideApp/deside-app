import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { checkAuthStatus } from "../services/apiService";

// ✅ Creación del contexto del servidor
const ServerContext = createContext();

// ✅ Hook para acceder al contexto del servidor de manera segura
export const useServer = () => {
  const context = useContext(ServerContext);
  if (!context) throw new Error("useServer debe usarse dentro de un ServerProvider");
  return context;
};

// 🔹 Estados posibles de autenticación
const AUTH_STATUS = {
  NOT_AUTHENTICATED: "not_authenticated",
  AUTHENTICATED: "authenticated",
};

// ✅ Proveedor del contexto del servidor
export const ServerProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // ✅ **Función para sincronizar autenticación con el backend**
  const syncAuthStatus = useCallback(async () => {
    console.log("🔄 Sincronizando autenticación con el backend...");

    const authStatus = await checkAuthStatus();
    setIsAuthenticated(authStatus.isAuthenticated);
    setIsReady(true);
  }, []);

  // ✅ **Verificamos autenticación solo cuando la app inicia**
  useEffect(() => {
    syncAuthStatus();
  }, [syncAuthStatus]);

  const serverContextValue = useMemo(() => ({
    isAuthenticated,
    isReady,
    syncAuthStatus,
  }), [isAuthenticated, isReady]);

  return (
    <ServerContext.Provider value={serverContextValue}>
      {children}
    </ServerContext.Provider>
  );
};

export default ServerProvider;
