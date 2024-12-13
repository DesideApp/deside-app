import { fetchWithAuth } from './authService'; // Importar fetchWithAuth para autenticación

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Verificar que la URL del backend esté definida
if (!BASE_URL) {
    throw new Error('Backend URL not defined.');
}

// Obtener contactos
export const getContacts = async () => {
    try {
        console.log('Fetching contacts from:', `${BASE_URL}/api/contacts`);
        const response = await fetchWithAuth(`${BASE_URL}/api/contacts`);
        if (!response.ok) {
            throw new Error('Error al obtener contactos.');
        }
        return await response.json();
    } catch (error) {
        console.error('Error en getContacts:', error);
        throw error;
    }
};

// Agregar contacto
export const addContact = async (pubkey) => {
    try {
        console.log('Adding contact with pubkey:', pubkey);
        const response = await fetchWithAuth(`${BASE_URL}/api/contacts/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pubkey }),
        });
        if (!response.ok) {
            throw new Error('Error al agregar contacto.');
        }
        return await response.json();
    } catch (error) {
        console.error('Error en addContact:', error);
        throw error;
    }
};

// Aceptar contacto
export const acceptContact = async (pubkey) => {
    try {
        console.log('Accepting contact with pubkey:', pubkey);
        const response = await fetchWithAuth(`${BASE_URL}/api/contacts/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pubkey }),
        });
        if (!response.ok) {
            throw new Error('Error al aceptar contacto.');
        }
        return await response.json();
    } catch (error) {
        console.error('Error en acceptContact:', error);
        throw error;
    }
};

// Rechazar contacto
export const rejectContact = async (pubkey) => {
    try {
        console.log('Rejecting contact with pubkey:', pubkey);
        const response = await fetchWithAuth(`${BASE_URL}/api/contacts/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pubkey }),
        });
        if (!response.ok) {
            throw new Error('Error al rechazar contacto.');
        }
        return await response.json();
    } catch (error) {
        console.error('Error en rejectContact:', error);
        throw error;
    }
};
