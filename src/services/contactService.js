import { apiRequest, checkWalletRegistered } from "./apiService";

/**
 * 🔹 **Gestión centralizada de contactos**
 */
export async function fetchContacts() {
    try {
        return (await apiRequest("/api/contacts", { method: "GET" }))?.contacts || [];
    } catch {
        return []; // ✅ No mostramos error innecesario
    }
}

/**
 * 🔹 **Enviar solicitud de contacto con verificación previa**
 */
export async function sendContactRequest(pubkey) {
    if (!pubkey) return { success: false, error: "Clave pública no proporcionada." };

    // 🔍 **Verificamos si la wallet está registrada antes de enviar la solicitud**
    const { registered, error } = await checkWalletRegistered(pubkey);
    if (error) return { success: false, error: "Error verificando wallet." };
    if (!registered) return { success: false, error: "Wallet no registrada." };

    return handleContactAction("/api/contacts/send", "POST", pubkey);
}

/**
 * 🔹 **Aceptar solicitud de contacto**
 */
export async function approveContact(pubkey) {
    return handleContactAction("/api/contacts/accept", "POST", pubkey);
}

/**
 * 🔹 **Eliminar contacto**
 */
export async function rejectContact(pubkey) {
    return handleContactAction("/api/contacts/remove", "DELETE", pubkey);
}

/**
 * 🔹 **Manejo unificado de acciones sobre contactos**
 */
async function handleContactAction(endpoint, method, pubkey) {
    if (!pubkey) return { success: false, error: "Clave pública no proporcionada." };

    try {
        const response = await apiRequest(endpoint, {
            method,
            body: JSON.stringify({ pubkey }),
        });

        return response?.error 
            ? { success: false, error: response.error } 
            : { success: true, message: response.message };

    } catch {
        return { success: false, error: "Error en la solicitud." }; // ✅ Sin logs extra
    }
}
