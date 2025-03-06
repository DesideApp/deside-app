// 🛡️ **Obtener CSRF token desde la cookie**
export function getCSRFTokenFromCookie() {
  try {
    return document.cookie.match(/csrfToken=([^;]+)/)?.[1] || null;
  } catch {
    return null; // ✅ No mostramos error innecesario
  }
}

// 🔄 **Evitar múltiples intentos simultáneos de refresh**
let isRefreshing = false;
let refreshPromise = null;

/**
 * 🔄 **Renovar Token de Sesión si es necesario**
 */
export async function refreshToken() {
  if (isRefreshing) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await apiRequest("/api/auth/refresh", { method: "POST" });

      if (!response || response.error) {
        clearSession("expired");
        return false;
      }

      updateSessionTokens(response.accessToken, response.refreshToken, response.csrfToken);
      window.dispatchEvent(new Event("sessionRefreshed"));
      return true;
    } catch {
      clearSession("expired");
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * 🔓 **Eliminar credenciales del usuario y cerrar sesión**
 */
export function clearSession(reason = "manual") {
  localStorage.clear();
  sessionStorage.clear();
  window.dispatchEvent(new Event(reason === "expired" ? "sessionExpired" : "walletDisconnected"));
}

/**
 * 🔹 **Actualizar cookies con nuevos tokens**
 */
function updateSessionTokens(accessToken, refreshToken, csrfToken) {
  if (accessToken && refreshToken && csrfToken) {
    setCookie("accessToken", accessToken);
    setCookie("refreshToken", refreshToken);
    setCookie("csrfToken", csrfToken);
  }
}

/**
 * 📝 **Setear cookies de manera segura**
 */
function setCookie(name, value) {
  const domain = import.meta.env.VITE_APP_DOMAIN || "deside-app.vercel.app";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; domain=${domain}; Secure; SameSite=None`;
}

/**
 * 📝 **Eliminar cookies de manera segura**
 */
function clearCookie(name) {
  document.cookie = `${name}=; Max-Age=0; path=/; domain=${import.meta.env.VITE_APP_DOMAIN || "deside-app.vercel.app"}; Secure; SameSite=None`;
}

/**
 * 🔍 **Obtener un token de sesión actual**
 */
function getCookie(name) {
  return document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))?.[2] || null;
}
