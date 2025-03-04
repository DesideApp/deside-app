import { apiRequest } from "./apiService";

/**
 * 🔹 **Gestión centralizada de contactos**
 */
export async function fetchContacts() {
    try {
        const response = await apiRequest("/api/contacts", { method: "GET" });
        return response?.contacts || [];
    } catch (error) {
        console.error("❌ Error al obtener contactos:", error.message || error);
        return [];
    }
}

/**
 * 🔹 **Enviar solicitud de contacto**
 */
export async function sendContactRequest(pubkey) {
    return handleContactAction("/api/contacts/send", "POST", pubkey, "enviar solicitud de contacto");
}

/**
 * 🔹 **Aceptar solicitud de contacto**
 */
export async function approveContact(pubkey) {
    return handleContactAction("/api/contacts/accept", "POST", pubkey, "aceptar solicitud de contacto");
}

/**
 * 🔹 **Eliminar contacto**
 */
export async function rejectContact(pubkey) {
    return handleContactAction("/api/contacts/remove", "DELETE", pubkey, "eliminar contacto");
}

/**
 * 🔹 **Manejo unificado de acciones sobre contactos**
 */
async function handleContactAction(endpoint, method, pubkey, actionDescription) {
    try {
        if (!pubkey) throw new Error("Clave pública no proporcionada.");

        const response = await apiRequest(endpoint, {
            method,
            body: JSON.stringify({ pubkey }),
        });

        if (!response || response.error) {
            console.warn(`⚠️ No se pudo ${actionDescription}:`, response?.error || "Respuesta inválida");
            return { success: false, error: response?.error || "Error desconocido" };
        }

        return { success: true, message: response.message };
    } catch (error) {
        console.error(`❌ Error al ${actionDescription}:`, error.message || error);
        return { success: false, error: error.message || "Error desconocido" };
    }
}
