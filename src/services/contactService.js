import { apiRequest } from "./apiService";

/**
 * 🔹 **Obtener contactos**
 */
export function fetchContacts() {
    return apiRequest("/api/contacts", { method: "GET" });
}

/**
 * 🔹 **Enviar solicitud de contacto**
 */
export function sendContactRequest(pubkey) {
    return apiRequest("/api/contacts/send", {
        method: "POST",
        body: JSON.stringify({ pubkey }),
    });
}

/**
 * 🔹 **Aceptar solicitud de contacto**
 */
export function approveContact(pubkey) {
    return apiRequest("/api/contacts/accept", {
        method: "POST",
        body: JSON.stringify({ pubkey }),
    });
}

/**
 * 🔹 **Eliminar contacto**
 */
export function rejectContact(pubkey) {
    return apiRequest("/api/contacts/remove", {
        method: "DELETE",
        body: JSON.stringify({ pubkey }),
    });
}
