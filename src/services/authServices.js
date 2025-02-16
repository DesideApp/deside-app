import { getToken, setToken, removeToken } from "./tokenService.js";
import API_BASE_URL from "../config/apiConfig.js";

export async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    if (!token) {
        console.warn("🔴 No se encontró un token válido. Por favor, re-autentícate.");
        throw new Error("Token inválido. Por favor, vuelve a autenticarte.");
    }
    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };
    const response = await fetch(url, options);
    if (response.status === 403) {
        console.warn("⚠️ Token inválido, cerrando sesión.");
        logout();
        throw new Error("Token inválido. Por favor, vuelve a autenticarte.");
    }
    return response;
}

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

export function logout() {
    console.info("🔵 Cerrando sesión y eliminando credenciales.");
    removeToken();
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletType");
    window.dispatchEvent(new Event("walletDisconnected"));
}
