import { getToken, setToken, removeToken, refreshToken } from "./tokenService.js";
import API_BASE_URL from "../config/apiConfig.js";

// 🚀 **Peticiones con autenticación**
export async function fetchWithAuth(url, options = {}) {
    let token = getToken();
    if (!token) {
        console.warn("🔴 No se encontró un token válido, intentando renovar...");
        token = await refreshToken();

        if (!token) {
            console.error("❌ No se pudo renovar el token. Se requiere autenticación.");
            removeToken();
            throw new Error("⚠️ Token inválido. Por favor, vuelve a autenticarte.");
        }
    }

    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, options);

    if (response.status === 403) {
        console.warn("⚠️ Token inválido, intentando renovar...");
        token = await refreshToken();

        if (!token) {
            console.error("❌ No se pudo renovar el token. Cerrando sesión.");
            logout();
            return response;
        }

        options.headers.Authorization = `Bearer ${token}`;
        return fetch(url, options);
    }

    return response;
}

// 🚀 **Autenticación con Wallet**
export async function authenticateWithServer(pubkey, signature, message) {
    try {
        console.log("🔵 Enviando autenticación con:", { pubkey, signature, message });

        const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pubkey, signature, message }),
        });

        if (!response.ok) throw new Error("❌ Fallo en autenticación");

        const { token, refreshToken } = await response.json();
        setToken(token, refreshToken);

        console.log("✅ Autenticación exitosa. Token almacenado.");
        return token;
    } catch (error) {
        console.error("❌ Error en `authenticateWithServer()`:", error);
        throw error;
    }
}

// 🚀 **Cerrar sesión segura**
export function logout() {
    console.info("🔵 Cerrando sesión y eliminando credenciales.");
    removeToken();
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletType");
    window.dispatchEvent(new Event("walletDisconnected"));
}
