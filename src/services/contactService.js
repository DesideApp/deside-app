import { apiRequest } from './apiService.js';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://backend-deside.onrender.com';

// Verificar que la URL del backend esté definida
if (!BASE_URL) {
    throw new Error('Backend URL not defined.');
}

console.log('BASE_URL:', BASE_URL); // Log para verificar la URL base

// Obtener contactos
export const getContacts = async () => {
    try {
        console.log('Fetching contacts from:', `${BASE_URL}/api/contacts`);
        const data = await apiRequest('/api/contacts');
        console.log('Contacts data:', data); // Log de datos de contactos
        return data;
    } catch (error) {
        console.error('Error en getContacts:', error);
        throw error;
    }
};

// Agregar contacto
export const addContact = async (pubkey) => {
    try {
        console.log('Adding contact with pubkey:', pubkey);
        const data = await apiRequest('/api/contacts/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pubkey }),
        });
        console.log('Add contact response:', data); // Log de respuesta de agregar contacto
        return data;
    } catch (error) {
        console.error('Error en addContact:', error);
        throw error;
    }
};

// Aceptar contacto
export const acceptContact = async (pubkey) => {
    try {
        console.log('Accepting contact with pubkey:', pubkey);
        const data = await apiRequest('/api/contacts/accept', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pubkey }),
        });
        console.log('Accept contact response:', data); // Log de respuesta de aceptar contacto
        return data;
    } catch (error) {
        console.error('Error en acceptContact:', error);
        throw error;
    }
};

// Rechazar contacto
export const rejectContact = async (pubkey) => {
    try {
        console.log('Rejecting contact with pubkey:', pubkey);
        const data = await apiRequest('/api/contacts/reject', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pubkey }),
        });
        console.log('Reject contact response:', data); // Log de respuesta de rechazar contacto
        return data;
    } catch (error) {
        console.error('Error en rejectContact:', error);
        throw error;
    }
};
