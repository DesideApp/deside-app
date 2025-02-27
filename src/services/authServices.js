import { getCSRFTokenFromCookie, clearSession } from "./tokenService.js";
import API_BASE_URL from "../config/apiConfig.js";

// 🔒 **Enviar solicitud autenticada al backend**
export async function fetchWithAuth(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include", // ✅ Incluir cookies en las solicitudes
    headers: {
      ...options.headers,
      "X-CSRF-Token": getCSRFTokenFromCookie(), // ✅ Enviar CSRF token desde cookie
    },
  });

  // ✅ Si no está autenticado o hay problema con CSRF, limpiar sesión
  if (response.status === 401 || response.status === 403) {
    console.warn("⚠️ La sesión ha expirado o el CSRF token no es válido. Cerrando sesión.");
    clearSession();
    window.location.href = "/login";
  }

  return response;
}

// 🔵 **Autenticar con el servidor usando la firma de Solana**
export async function authenticateWithServer(pubkey, signature, message) {
  try {
    console.log("🔵 Enviando autenticación al backend con firma válida...");

    const response = await fetch(`${API_BASE_URL}/api/auth/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ pubkey, signature, message }),
    });

    if (!response.ok) throw new Error("❌ Fallo en autenticación");

    console.log("✅ Autenticación exitosa, el backend gestionará los tokens.");
    return await response.json();
  } catch (error) {
    console.error("❌ Error en `authenticateWithServer()`:", error.message || error);
    throw error;
  }
}

// 🔄 **Verificar estado de autenticación directamente desde el backend**
export async function checkAuthStatus() {
  try {
    console.log("🔄 Verificando estado de autenticación...");

    const response = await fetch(`${API_BASE_URL}/api/auth/status`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      console.warn("❌ El usuario no está autenticado.");
      return { isAuthenticated: false };
    }

    const data = await response.json();
    console.log("✅ Estado de autenticación verificado:", data);
    return data;
  } catch (error) {
    console.error("❌ Error al verificar el estado de autenticación:", error.message || error);
    return { isAuthenticated: false };
  }
}

// 🔐 **Cerrar sesión de manera segura eliminando cookies**
export function logout(redirect = true) {
  console.info("🔵 Cerrando sesión y eliminando credenciales.");
  clearSession(); // ✅ Elimina las cookies de sesión

  // 🔄 Redireccionar al login
  if (redirect) {
    window.location.href = "/login";
  }
}
