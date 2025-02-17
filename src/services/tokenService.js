// 🔐 **Guardar token en localStorage**
export function setToken(token, refreshToken) {
    if (!token || typeof token !== "string") {
        console.warn("🔴 Intento de almacenar un token inválido.");
        return;
    }

    try {
        localStorage.setItem("jwtToken", token);

        if (refreshToken && typeof refreshToken === "string") {
            localStorage.setItem("refreshToken", refreshToken);
        }
        console.log("✅ Token y refreshToken guardados correctamente.");
    } catch (error) {
        console.error("❌ Error al guardar los tokens:", error);
    }
}

// 🔓 **Obtener el token desde localStorage**
export function getToken() {
    return localStorage.getItem("jwtToken") || null;
}

// 🗑️ **Eliminar token y cerrar sesión**
export function removeToken() {
    console.warn("⚠️ Eliminando credenciales del usuario...");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("refreshToken");
    window.dispatchEvent(new Event("walletDisconnected")); // 🔄 Notificar a la app
}

// ⏳ **Verificar si el token ha expirado**
export function isTokenExpired() {
    const token = getToken();
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp < Math.floor(Date.now() / 1000);
    } catch (error) {
        console.error("🔴 Error al analizar JWT:", error);
        return true;
    }
}

// 🔄 **Renovar token usando el refreshToken**
export async function refreshToken() {
    try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            console.warn("🔴 No se encontró refresh token. Se requiere re-autenticación.");
            removeToken();
            throw new Error("No refresh token found");
        }

        const response = await fetch("https://backend-deside.onrender.com/api/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (response.status === 401) {
            console.warn("🔴 Refresh token inválido. Cerrando sesión.");
            removeToken();
            throw new Error("Unauthorized - Refresh token invalid");
        }

        if (!response.ok) {
            console.warn("🔴 No se pudo renovar el token. Se requiere nueva autenticación.");
            removeToken();
            throw new Error("Failed to refresh token");
        }

        const data = await response.json();
        setToken(data.token, data.refreshToken);
        console.log("✅ Token renovado correctamente.");
        return data.token;
    } catch (error) {
        console.error("🔴 Error al renovar token:", error);
        removeToken();
        throw error;
    }
}

// 🔍 **Obtener todos los tokens disponibles**
export function getTokens() {
    return { jwtToken: getToken(), refreshToken: localStorage.getItem("refreshToken") };
}
