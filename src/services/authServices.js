import { getToken, setToken, removeToken, refreshToken } from "./tokenService.js";
import API_BASE_URL from "../config/apiConfig.js";

// 🔐 **Realiza solicitudes autenticadas al backend**
export async function fetchWithAuth(url, options = {}) {
    let token = getToken();

    // Si no hay token o está expirado, intentamos renovarlo
    if (!token || isTokenExpired()) {
        console.warn("🔄 Token inválido o expirado. Intentando renovación...");
        try {
            token = await refreshToken();
        } catch (error) {
            console.error("❌ No se pudo renovar el token. Cerrando sesión.");
            logout();
            throw new Error("Token inválido. Por favor, vuelve a autenticarte.");
        }
    }

    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, options);

    // Si el token sigue siendo inválido, forzamos logout
    if (response.status === 403) {
        console.warn("⚠️ Token inválido, cerrando sesión.");
        logout();
        throw new Error("Token inválido. Por favor, vuelve a autenticarte.");
    }

    return response;
}

// 🔵 **Autenticar con el servidor y obtener JWT**
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

// 🔄 **Registrar wallet en el backend si no está registrada**
export async function registerWallet(pubkey) {
    try {
        console.log(`🔵 Registrando wallet ${pubkey} en el backend...`);
        const response = await fetch(`${API_BASE_URL}/api/auth/register-wallet`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pubkey }),
        });

        if (!response.ok) throw new Error("❌ Error registrando wallet.");
        console.log(`✅ Wallet ${pubkey} registrada correctamente.`);
    } catch (error) {
        console.error("❌ Error en `registerWallet()`:", error);
        throw error;
    }
}

// 🔐 **Cerrar sesión de manera segura**
export function logout() {
    console.info("🔵 Cerrando sesión y eliminando credenciales.");
    removeToken();
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletType");
    window.dispatchEvent(new Event("walletDisconnected"));
}
