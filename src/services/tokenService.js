// 🛡️ **Obtener CSRF token desde la cookie**
export function getCSRFTokenFromCookie() {
  try {
    const match = document.cookie.match(/csrfToken=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch (error) {
    console.error("❌ Error al obtener CSRF token:", error);
    return null;
  }
}

// 🔄 **Evitar múltiples intentos simultáneos de refresh**
let isRefreshing = false;

// 🔄 **Renovar Token de Sesión si es necesario**
export async function refreshToken() {
  if (isRefreshing) {
    console.warn("⚠️ Intento de refresco en curso. Evitando múltiples solicitudes.");
    return false;
  }
  isRefreshing = true;

  try {
    const currentAccessToken = getCookie("accessToken");

    if (currentAccessToken) {
      console.log("🔄 Token aún es válido. No es necesario renovarlo.");
      isRefreshing = false;
      return true;
    }

    console.log("🔄 Intentando renovar el token...");

    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      console.warn("⚠️ No se pudo renovar el token. Cerrando sesión.");
      clearSession("expired");
      isRefreshing = false;
      return false;
    }

    const data = await response.json();
    updateSessionTokens(data.accessToken, data.refreshToken);
    window.dispatchEvent(new Event("sessionRefreshed")); // 🔄 Emitir evento global
    isRefreshing = false;
    return true;
  } catch (error) {
    console.error("❌ Error en refreshToken():", error.message || error);
    clearSession("expired");
    isRefreshing = false;
    return false;
  }
}

// 🔓 **Eliminar credenciales del usuario y cerrar sesión si es necesario**
export function clearSession(reason = "manual") {
  console.warn(`⚠️ Eliminando credenciales del usuario... (Razón: ${reason})`);

  ["accessToken", "refreshToken", "csrfToken"].forEach(clearCookie);
  if (reason === "expired") {
    console.warn("🔴 La sesión ha expirado. Cerrando sesión.");
    window.dispatchEvent(new Event("sessionExpired"));
  } else {
    console.warn("🔵 Logout manual detectado. Desconectando wallet.");
    window.dispatchEvent(new Event("walletDisconnected"));
  }
}

// 🔹 **Actualizar cookies con nuevos tokens**
function updateSessionTokens(accessToken, refreshToken) {
  if (accessToken && refreshToken) {
    setCookie("accessToken", accessToken);
    setCookie("refreshToken", refreshToken);
    console.log("✅ Token renovado correctamente.");
  } else {
    console.warn("⚠️ No se proporcionaron nuevos tokens. La sesión podría haber expirado.");
    clearSession("expired");
  }
}

// 📝 **Setear cookies de manera segura**
function setCookie(name, value) {
  const domain = import.meta.env.VITE_APP_DOMAIN || "deside-app.vercel.app";
  const secure = import.meta.env.PROD ? "Secure; SameSite=None" : "SameSite=Lax";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; domain=.${domain}; ${secure}`;
}

// 📝 **Eliminar cookies de manera segura**
function clearCookie(name) {
  const domain = import.meta.env.VITE_APP_DOMAIN || "deside-app.vercel.app";
  document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}; Secure; SameSite=None`;
}

// 🔍 **Obtener un token de sesión actual**
function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

// 🔍 **Obtener CSRF token actual**
export function getCSRFToken() {
  return getCSRFTokenFromCookie();
}
