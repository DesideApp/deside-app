import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { checkAuthStatus } from "../services/apiService";

const ServerContext = createContext();

// ✅ Hook para acceder al contexto
export const useServer = () => {
  const context = useContext(ServerContext);
  if (!context) throw new Error("useServer debe usarse dentro de un ServerProvider");
  return context;
};

// 🔹 Estados posibles de autenticación (por si en un futuro quieres hacer condicionales)
const AUTH_STATUS = {
  NOT_AUTHENTICATED: "not_authenticated",
  AUTHENTICATED: "authenticated",
};

// ✅ Proveedor del contexto del servidor
export const ServerProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // ✅ **Función para sincronizar autenticación con el backend**, sin logs ruidosos
  const syncAuthStatus = useCallback(async () => {
    try {
      // 🔹 Consulta silenciosa del estado de auth
      const authStatus = await checkAuthStatus();
      setIsAuthenticated(authStatus.isAuthenticated);
    } catch (error) {
      // 🔹 Si hay error (401, 403, etc.), silenciosamente asumimos que no está auth
      setIsAuthenticated(false);
    } finally {
      // 🔹 Marcamos como "listo" aunque falle
      setIsReady(true);
    }
  }, []);

  // ✅ **Verificamos autenticación solo cuando la app inicia**
  useEffect(() => {
    syncAuthStatus();
  }, [syncAuthStatus]);

  // 🔹 Resumimos estado y función de sincronización
  const serverContextValue = useMemo(() => ({
    isAuthenticated,
    isReady,
    syncAuthStatus,
  }), [isAuthenticated, isReady, syncAuthStatus]);

  return (
    <ServerContext.Provider value={serverContextValue}>
      {children}
    </ServerContext.Provider>
  );
};

export default ServerProvider;
