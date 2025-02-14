import React, { useState } from 'react';
import { sendContactRequest } from '../../services/contactService';

const AddContactForm = ({ onContactAdded }) => {
    const [pubkey, setPubkey] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleAddContact = async () => {
        if (!pubkey) {
            setErrorMessage('⚠️ Por favor, introduce una clave pública.');
            return;
        }

        try {
            await sendContactRequest(pubkey);
            setSuccessMessage('✅ Solicitud de contacto enviada con éxito.');
            setPubkey('');
            setErrorMessage('');
            onContactAdded();
        } catch (error) {
            console.error('❌ Error enviando la solicitud:', error);
            setErrorMessage(error.message || 'Error al enviar solicitud.');
        }
    };

    return (
        <div>
            <h2>Añadir Contacto</h2>
            <input
                type="text"
                value={pubkey}
                onChange={(e) => setPubkey(e.target.value)}
                placeholder="Introduce la clave pública"
            />
            <button onClick={handleAddContact}>Enviar Solicitud</button>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        </div>
    );
};

export default AddContactForm;
