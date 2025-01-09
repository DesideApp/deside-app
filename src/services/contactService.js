import { getContacts, addContact, acceptContact, rejectContact } from './apiService.js';
import { getTokens } from './tokenService.js'; // Import getTokens function

// Validar clave pública
function validatePubkey(pubkey) {
    if (!pubkey) {
        throw new Error('Public key is required.');
    }
}

// Obtener contactos
export async function fetchContacts() {
    try {
        const { jwtToken } = getTokens();
        const data = await getContacts();
        return data;
    } catch (error) {
        throw new Error('Failed to fetch contacts. Please try again.');
    }
}

// Agregar contacto
export async function createContact(pubkey) {
    try {
        validatePubkey(pubkey);
        const { jwtToken } = getTokens();
        const data = await addContact({ pubkey });
        return data;
    } catch (error) {
        throw new Error('Failed to add contact. Please try again.');
    }
}

// Aceptar contacto
export async function approveContact(pubkey) {
    try {
        validatePubkey(pubkey);
        const { jwtToken } = getTokens();
        const data = await acceptContact(pubkey);
        return data;
    } catch (error) {
        throw new Error('Failed to accept contact. Please try again.');
    }
}

// Rechazar contacto
export async function declineContact(pubkey) {
    try {
        validatePubkey(pubkey);
        const { jwtToken } = getTokens();
        const data = await rejectContact(pubkey);
        return data;
    } catch (error) {
        throw new Error('Failed to reject contact. Please try again.');
    }
}
