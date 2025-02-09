import { getContacts, addContact, acceptContact, rejectContact } from './apiService.js';

export async function fetchContacts() {
    try {
        const response = await getContacts();
        return response.contacts || []; // Asegurándonos de que retorne contactos, o un arreglo vacío si no hay.
    } catch (error) {
        console.error('Failed to fetch contacts:', error);
        throw new Error('Unable to fetch contacts. Please try again.');
    }
}

export async function createContact(pubkey) {
    try {
        const response = await addContact({ pubkey });
        return response; // Podrías retornar la respuesta de la API si es necesario
    } catch (error) {
        console.error('Failed to add contact:', error);
        throw new Error('Unable to add contact. Please try again.');
    }
}

export async function approveContact(pubkey) {
    try {
        const response = await acceptContact(pubkey);
        return response; // Retornar la respuesta de la API, por si es necesario realizar más acciones con ella
    } catch (error) {
        console.error('Failed to accept contact:', error);
        throw new Error('Unable to accept contact. Please try again.');
    }
}

export async function declineContact(pubkey) {
    try {
        const response = await rejectContact(pubkey);
        return response; // Retornar la respuesta de la API, por si es necesario hacer algo con la respuesta
    } catch (error) {
        console.error('Failed to reject contact:', error);
        throw new Error('Unable to reject contact. Please try again.');
    }
}
