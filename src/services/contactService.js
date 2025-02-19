import { apiRequest } from "./apiService";
import { ensureWalletState } from "../services/walletStateService.js"; // ✅ Importación corregida

// 🔹 **Obtener contactos**
export async function fetchContacts() {
    try {
        await ensureWalletState(); // ✅ Esto ya maneja autenticación
        return apiRequest("/api/contacts", { method: "GET" });
    } catch (error) {
        console.error("❌ Error al obtener contactos:", error);
        throw error;
    }
}

// 🔹 **Enviar solicitud de contacto**
export async function sendContactRequest(pubkey) {
    try {
        await ensureWalletState();
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
        await ensureWalletState();
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
        await ensureWalletState();
        return apiRequest("/api/contacts/remove", {
            method: "DELETE",
            body: JSON.stringify({ pubkey }),
        });
    } catch (error) {
        console.error("❌ Error al eliminar contacto:", error);
        throw error;
    }
}
