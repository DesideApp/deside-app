import { apiRequest } from "./apiService";

/**
 * 🔹 **Obtener contactos**
 */
export async function fetchContacts() {
    try {
        console.log("📡 Obteniendo lista de contactos...");
        const response = await apiRequest("/api/contacts", { method: "GET" });
        console.log("✅ Contactos obtenidos:", response);
        return response;
    } catch (error) {
        console.error("❌ Error al obtener contactos:", error);
        throw error;
    }
}

/**
 * 🔹 **Enviar solicitud de contacto**
 */
export async function sendContactRequest(pubkey) {
    try {
        console.log(`📨 Enviando solicitud de contacto a: ${pubkey}...`);
        const response = await apiRequest("/api/contacts/send", {
            method: "POST",
            body: JSON.stringify({ pubkey }),
        });
        console.log("✅ Solicitud enviada:", response);
        return response;
    } catch (error) {
        console.error("❌ Error al enviar solicitud de contacto:", error);
        throw error;
    }
}

/**
 * 🔹 **Aceptar solicitud de contacto**
 */
export async function approveContact(pubkey) {
    try {
        console.log(`✅ Aceptando solicitud de contacto de: ${pubkey}...`);
        const response = await apiRequest("/api/contacts/accept", {
            method: "POST",
            body: JSON.stringify({ pubkey }),
        });
        console.log("✅ Contacto aceptado:", response);
        return response;
    } catch (error) {
        console.error("❌ Error al aceptar contacto:", error);
        throw error;
    }
}

/**
 * 🔹 **Eliminar contacto**
 */
export async function rejectContact(pubkey) {
    try {
        console.log(`🗑 Eliminando contacto: ${pubkey}...`);
        const response = await apiRequest("/api/contacts/remove", {
            method: "DELETE",
            body: JSON.stringify({ pubkey }),
        });
        console.log("✅ Contacto eliminado:", response);
        return response;
    } catch (error) {
        console.error("❌ Error al eliminar contacto:", error);
        throw error;
    }
}
