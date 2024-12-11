const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const getContacts = async () => {
    const response = await fetch(`${BASE_URL}/api/contacts`);
    if (!response.ok) throw new Error('Error al obtener contactos.');
    return await response.json();
};

export const addContact = async (pubkey) => {
    const response = await fetch(`${BASE_URL}/api/contacts/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pubkey }),
    });
    if (!response.ok) throw new Error('Error al agregar contacto.');
    return await response.json();
};

export const acceptContact = async (pubkey) => {
    const response = await fetch(`${BASE_URL}/api/contacts/accept`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pubkey }),
    });
    if (!response.ok) throw new Error('Error al aceptar contacto.');
    return await response.json();
};

export const rejectContact = async (pubkey) => {
    const response = await fetch(`${BASE_URL}/api/contacts/reject`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pubkey }),
    });
    if (!response.ok) throw new Error('Error al rechazar contacto.');
    return await response.json();
};
