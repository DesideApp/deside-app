// 🛡️ **Obtener CSRF token desde la cookie**
export function getCSRFTokenFromCookie() {
  const match = document.cookie.match(/csrfToken=([^;]+)/);
  return match ? match[1] : null;
}

// 🔓 **Eliminar las cookies al cerrar sesión**
export function clearSession() {
  console.warn("⚠️ Eliminando credenciales del usuario...");
  document.cookie = "accessToken=; Max-Age=0; path=/; secure; SameSite=None";
  document.cookie = "refreshToken=; Max-Age=0; path=/; secure; SameSite=None";
  document.cookie = "csrfToken=; Max-Age=0; path=/; secure; SameSite=None";
  window.dispatchEvent(new Event("walletDisconnected")); // 🔄 Notificar a la app
}

// 🔍 **Obtener CSRF token actual**
export function getCSRFToken() {
  return getCSRFTokenFromCookie();
}
