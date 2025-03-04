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

// 🔄 **Renovar Token de Sesión y actualizar cookies**
export async function refreshToken() {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      console.warn("❌ No se pudo renovar el token. Cerrando sesión...");
      clearSession();
      return null;
    }

    const data = await response.json();

    // ✅ Actualizar cookies con los nuevos tokens
    setCookie("accessToken", data.accessToken);
    setCookie("refreshToken", data.refreshToken);

    console.log("🔄 Token renovado correctamente.");
    return data;
  } catch (error) {
    console.error("❌ Error en refreshToken():", error.message || error);
    clearSession();
    return null;
  }
}

// 🔓 **Eliminar cookies, almacenamiento local y cerrar sesión**
export function clearSession() {
  console.warn("⚠️ Eliminando credenciales del usuario...");

  ["accessToken", "refreshToken", "csrfToken"].forEach(clearCookie);

  // ✅ También limpiar `localStorage` y `sessionStorage`
  localStorage.clear();
  sessionStorage.clear();

  window.dispatchEvent(new Event("walletDisconnected")); // 🔄 Notificar a la app
}

// 📝 **Setear cookies de manera segura**
function setCookie(name, value) {
  const secure = process.env.NODE_ENV === "production";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; domain=.deside-app.vercel.app; ${secure ? "secure; SameSite=None" : "SameSite=Lax"}`;
}

// 📝 **Eliminar cookies de manera segura**
function clearCookie(name) {
  document.cookie = `${name}=; Max-Age=0; path=/; domain=.deside-app.vercel.app; secure; SameSite=None`;
}

// 🔍 **Obtener CSRF token actual**
export function getCSRFToken() {
  return getCSRFTokenFromCookie();
}
