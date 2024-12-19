import { apiRequest } from '../services/apiService.js';
import { getTokens } from '../services/tokenService.js'; // Import getTokens function
import API_BASE_URL from '../config/apiConfig.js'; // Import API_BASE_URL

// Validar clave pública
function validatePubkey(pubkey) {
    if (!pubkey) {
        throw new Error('Public key is required.');
    }
}

// Obtener contactos
export const getContacts = async () => {
    try {
        const { jwtToken } = getTokens();

        console.log('Fetching contacts from:', `${API_BASE_URL}/api/contacts`);
        const data = await apiRequest(`${API_BASE_URL}/api/contacts`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            },
        });

        console.log('Contacts data:', data); // Log de datos de contactos
        return data;
    } catch (error) {
        console.error('Error en getContacts:', error);
        throw new Error('Failed to fetch contacts. Please try again.');
    }
};

// Agregar contacto
export const addContact = async (pubkey) => {
    try {
        validatePubkey(pubkey);

        const { jwtToken } = getTokens();

        if (process.env.NODE_ENV !== 'production') {
            console.log('Adding contact with pubkey:', pubkey);
        }

        const data = await apiRequest(`${API_BASE_URL}/api/contacts/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}` // Enviar el token JWT
            },
            body: JSON.stringify({ pubkey }),
        });

        console.log('Add contact response:', data); // Log de respuesta de agregar contacto
        return data;
    } catch (error) {
        console.error(`Error en addContact con pubkey ${pubkey}:`, error);
        throw new Error('Failed to add contact. Please try again.');
    }
};

// Aceptar contacto
export const acceptContact = async (pubkey) => {
    try {
        validatePubkey(pubkey);

        const { jwtToken } = getTokens();

        if (process.env.NODE_ENV !== 'production') {
            console.log('Accepting contact with pubkey:', pubkey);
        }

        const data = await apiRequest(`${API_BASE_URL}/api/contacts/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}` // Enviar el token JWT
            },
            body: JSON.stringify({ pubkey }),
        });

        console.log('Accept contact response:', data); // Log de respuesta de aceptar contacto
        return data;
    } catch (error) {
        console.error(`Error en acceptContact con pubkey ${pubkey}:`, error);
        throw new Error('Failed to accept contact. Please try again.');
    }
};

// Rechazar contacto
export const rejectContact = async (pubkey) => {
    try {
        validatePubkey(pubkey);

        const { jwtToken } = getTokens();

        if (process.env.NODE_ENV !== 'production') {
            console.log('Rejecting contact with pubkey:', pubkey);
        }

        const data = await apiRequest(`${API_BASE_URL}/api/contacts/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}` // Enviar el token JWT
            },
            body: JSON.stringify({ pubkey }),
        });

        console.log('Reject contact response:', data); // Log de respuesta de rechazar contacto
        return data;
    } catch (error) {
        console.error(`Error en rejectContact con pubkey ${pubkey}:`, error);
        throw new Error('Failed to reject contact. Please try again.');
    }
};
