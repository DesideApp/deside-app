// 🛡️ **Obtener CSRF token desde la cookie**
export function getCSRFToken() {
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
      const response = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
      if (!response.ok) {
        clearSession("expired");
        return false;
      }

      const data = await response.json();
      updateSessionTokens(data.accessToken, data.refreshToken);
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
  ["accessToken", "refreshToken", "csrfToken"].forEach(clearCookie);
  localStorage.clear();
  sessionStorage.clear();
  window.dispatchEvent(new Event(reason === "expired" ? "sessionExpired" : "walletDisconnected"));
}

/**
 * 🔹 **Actualizar cookies con nuevos tokens**
 */
function updateSessionTokens(accessToken, refreshToken) {
  if (accessToken && refreshToken) {
    setCookie("accessToken", accessToken);
    setCookie("refreshToken", refreshToken);
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
