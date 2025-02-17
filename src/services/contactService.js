import { apiRequest } from "./apiService";
import { ensureWalletState } from "../services/walletService.js"; // 🔥 Nueva validación de estado

// 🔹 **Obtener contactos**
export async function fetchContacts() {
    try {
        const status = await ensureWalletState(); // 🔥 **Validar autenticación**
        if (!status.isAuthenticated) throw new Error("❌ Wallet no autenticada.");

        return apiRequest("/api/contacts", { method: "GET" });
    } catch (error) {
        console.error("❌ Error al obtener contactos:", error);
        throw error;
    }
}

// 🔹 **Enviar solicitud de contacto**
export async function sendContactRequest(pubkey) {
    try {
        const status = await ensureWalletState();
        if (!status.isAuthenticated) throw new Error("❌ Wallet no autenticada.");

        return apiRequest("/api/contacts/send", {
            method: "POST",
            body: JSON.stringify({ pubkey }),
        });
    } catch (error) {
        console.error("❌ Error al enviar solicitud de contacto:", error);
        throw error;
    }
}

// 🔹 **Aceptar solicitud de contacto**
export async function approveContact(pubkey) {
    try {
        const status = await ensureWalletState();
        if (!status.isAuthenticated) throw new Error("❌ Wallet no autenticada.");

        return apiRequest("/api/contacts/accept", {
            method: "POST",
            body: JSON.stringify({ pubkey }),
        });
    } catch (error) {
        console.error("❌ Error al aceptar contacto:", error);
        throw error;
    }
}

// 🔹 **Eliminar contacto**
export async function rejectContact(pubkey) {
    try {
        const status = await ensureWalletState();
        if (!status.isAuthenticated) throw new Error("❌ Wallet no autenticada.");

        return apiRequest("/api/contacts/remove", {
            method: "DELETE",
            body: JSON.stringify({ pubkey }),
        });
    } catch (error) {
        console.error("❌ Error al eliminar contacto:", error);
        throw error;
    }
}
