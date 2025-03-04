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

// 🔄 **Renovar Token de Sesión si es necesario**
export async function refreshToken() {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      console.warn("⚠️ No se pudo renovar el token.");
      return null;
    }

    const data = await response.json();
    updateSessionTokens(data.accessToken, data.refreshToken);
    return data;
  } catch (error) {
    console.error("❌ Error en refreshToken():", error.message || error);
    return null;
  }
}

// 🔓 **Eliminar credenciales del usuario sin cerrar sesión inmediatamente**
export function clearSession() {
  console.warn("⚠️ Eliminando credenciales del usuario...");

  ["accessToken", "refreshToken", "csrfToken"].forEach(clearCookie);
  localStorage.clear();
  sessionStorage.clear();

  window.dispatchEvent(new Event("walletDisconnected"));
}

// 🔹 **Actualizar cookies con nuevos tokens**
function updateSessionTokens(accessToken, refreshToken) {
  if (accessToken && refreshToken) {
    setCookie("accessToken", accessToken);
    setCookie("refreshToken", refreshToken);
    console.log("✅ Token renovado correctamente.");
  } else {
    console.warn("⚠️ No se proporcionaron nuevos tokens. La sesión podría haber expirado.");
    clearSession();
  }
}

// 📝 **Setear cookies de manera segura**
function setCookie(name, value) {
  const domain = import.meta.env.VITE_APP_DOMAIN || "deside-app.vercel.app";
  const secure = import.meta.env.PROD ? "secure; SameSite=None" : "SameSite=Lax";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; domain=.${domain}; ${secure}`;
}

// 📝 **Eliminar cookies de manera segura**
function clearCookie(name) {
  const domain = import.meta.env.VITE_APP_DOMAIN || "deside-app.vercel.app";
  document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}; secure; SameSite=None`;
}

// 🔍 **Obtener CSRF token actual**
export function getCSRFToken() {
  return getCSRFTokenFromCookie();
}
