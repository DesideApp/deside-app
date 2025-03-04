import { apiRequest } from "./apiService";

/**
 * 🔹 **Obtener contactos**
 */
export async function fetchContacts() {
    try {
        console.log("📡 Obteniendo lista de contactos...");
        const response = await apiRequest("/api/contacts", { method: "GET" });

        if (!response || !Array.isArray(response.contacts)) {
            console.warn("⚠️ Respuesta inesperada del backend:", response);
            return [];
        }

        console.log("✅ Contactos obtenidos:", response.contacts);
        return response.contacts;
    } catch (error) {
        console.error("❌ Error al obtener contactos:", error.message || error);
        return []; // Evita que la app se rompa si hay un error
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

        if (!response || response.error) {
            console.warn("⚠️ No se pudo enviar la solicitud:", response?.error || "Respuesta inválida");
            return { success: false, error: response?.error || "Error desconocido" };
        }

        console.log("✅ Solicitud enviada:", response);
        return { success: true, message: response.message };
    } catch (error) {
        console.error("❌ Error al enviar solicitud de contacto:", error.message || error);
        return { success: false, error: error.message || "Error desconocido" };
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

        if (!response || response.error) {
            console.warn("⚠️ No se pudo aceptar el contacto:", response?.error || "Respuesta inválida");
            return { success: false, error: response?.error || "Error desconocido" };
        }

        console.log("✅ Contacto aceptado:", response);
        return { success: true, message: response.message };
    } catch (error) {
        console.error("❌ Error al aceptar contacto:", error.message || error);
        return { success: false, error: error.message || "Error desconocido" };
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

        if (!response || response.error) {
            console.warn("⚠️ No se pudo eliminar el contacto:", response?.error || "Respuesta inválida");
            return { success: false, error: response?.error || "Error desconocido" };
        }

        console.log("✅ Contacto eliminado:", response);
        return { success: true, message: response.message };
    } catch (error) {
        console.error("❌ Error al eliminar contacto:", error.message || error);
        return { success: false, error: error.message || "Error desconocido" };
    }
}
