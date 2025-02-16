import { fetchWithAuth } from './authServices';

// Obtener contactos
export async function fetchContacts() {
    try {
        const response = await fetchWithAuth("/api/contacts");
        if (!response.ok) throw new Error("Failed to fetch contacts.");
        const data = await response.json();
        return {
            confirmed: data.confirmed || [],
            pending: data.pending || [],
        };
    } catch (error) {
        console.error("❌ Error al obtener contactos:", error);
        throw new Error("Unable to fetch contacts. Please try again.");
    }
}

// Enviar solicitud de contacto
export async function sendContactRequest(pubkey) {
    try {
        const response = await fetchWithAuth("/api/contacts/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pubkey }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`❌ Error del servidor: ${errorData.message}`);
        }
        return await response.json();
    } catch (error) {
        console.error("❌ Error al enviar solicitud de contacto:", error);
        throw error;
    }
}

// Aceptar solicitud de contacto
export async function approveContact(pubkey) {
    try {
        const response = await fetchWithAuth("/api/contacts/accept", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pubkey }),
        });
        if (!response.ok) throw new Error("Failed to accept contact request.");
        return await response.json();
    } catch (error) {
        console.error("❌ Error al aceptar contacto:", error);
        throw error;
    }
}
