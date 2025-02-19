import API_BASE_URL from "../config/apiConfig.js";

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

// 🔄 **Renovar JWT usando el refreshToken**
export async function refreshToken() {
    try {
        console.warn("🔄 Intentando renovar el JWT con el refresh token...");

        const storedRefreshToken = localStorage.getItem("refreshToken");
        if (!storedRefreshToken) throw new Error("No hay refreshToken almacenado.");

        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });

        if (!response.ok) throw new Error("Error al renovar el token.");

        const { token } = await response.json();
        setToken(token); // Guardamos el nuevo token

        console.log("✅ JWT renovado con éxito.");
        return token;
    } catch (error) {
        console.error("❌ No se pudo renovar el JWT:", error);
        removeToken(); // Eliminamos credenciales si falla
        throw new Error("Token inválido. Se requiere autenticación.");
    }
}

// 🔄 **Renovación del JWT usando refreshToken**
export async function renewJWT() {
    try {
        return await refreshToken(); // Simplemente llamamos a la función que renueva el JWT
    } catch (error) {
        console.error("❌ Error en renewJWT():", error.message || error);
        throw error;
    }
}

// 🔍 **Obtener todos los tokens disponibles**
export function getTokens() {
    return { jwtToken: getToken(), refreshToken: localStorage.getItem("refreshToken") };
}
