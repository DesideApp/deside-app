import React, { useState } from 'react';
import { getCookie } from '../../services/authServices'; // Importar getCookie para obtener el token CSRF

const AddContactForm = ({ onContactAdded }) => {
    const [pubkey, setPubkey] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const addContact = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contacts/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`, // Enviar el token JWT
                    'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') // Enviar el token CSRF
                },
                body: JSON.stringify({ pubkey }),
            });

            if (!response.ok) {
                throw new Error('Failed to send contact request.');
            }

            alert('Contact request sent!');
            setPubkey('');
            setErrorMessage('');
            onContactAdded(); // Notifica al padre que se actualicen los datos
        } catch (error) {
            console.error('Error sending contact request:', error);
            setErrorMessage('Error sending contact request.');
        }
    };

    return (
        <div>
            <h2>Add a Contact</h2>
            <input
                type="text"
                value={pubkey}
                onChange={(e) => setPubkey(e.target.value)}
                placeholder="Enter public key"
            />
            <button onClick={addContact}>Send Request</button>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
};

export default AddContactForm;
