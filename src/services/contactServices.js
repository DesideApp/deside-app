import API_BASE_URL from '../apiConfig';
import { fetchWithAuth } from './authServices';

export async function getContacts() {
    const response = await fetchWithAuth(`${API_BASE_URL}/contacts`);
    if (!response.ok) {
        throw new Error('Error al obtener contactos');
    }
    return response.json();
}

export async function addContact(contact) {
    const response = await fetchWithAuth(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
    });
    if (!response.ok) {
        throw new Error('Error al agregar contacto');
    }
    return response.json();
}