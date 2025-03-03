// 🛡️ **Obtener CSRF token desde la cookie**
export function getCSRFTokenFromCookie() {
  const match = document.cookie.match(/csrfToken=([^;]+)/);
  return match ? match[1] : null;
}

// 🔓 **Eliminar las cookies al cerrar sesión**
export function clearSession() {
  console.warn("⚠️ Eliminando credenciales del usuario...");

  const cookieOptions = (secure) => 
    `Max-Age=0; path=/; domain=.deside-app.vercel.app; ${secure ? "secure; SameSite=None" : "SameSite=Lax"}`;

  document.cookie = `accessToken=; ${cookieOptions(process.env.NODE_ENV === "production")}`;
  document.cookie = `refreshToken=; ${cookieOptions(process.env.NODE_ENV === "production")}`;
  document.cookie = `csrfToken=; ${cookieOptions(process.env.NODE_ENV === "production")}`;

  window.dispatchEvent(new Event("walletDisconnected")); // 🔄 Notificar a la app
}

// 🔍 **Obtener CSRF token actual**
export function getCSRFToken() {
  return getCSRFTokenFromCookie();
}
