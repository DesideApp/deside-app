import React, { useState } from 'react';
import { signMessage } from '../../utils/solanaHelpers'; // Importar signMessage
import { getCookie } from '../../services/authServices'; // Importar getCookie para obtener el token CSRF
import { apiRequest } from '../../services/apiService'; // Importar apiRequest

const AddContactForm = ({ onContactAdded }) => {
    const [pubkey, setPubkey] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const addContact = async () => {
        if (!pubkey) {
            setErrorMessage('Por favor, introduce una clave pública.');
            return;
        }

        try {
            const selectedWallet = localStorage.getItem('selectedWallet'); // Obtener la wallet seleccionada
            if (!selectedWallet) {
                throw new Error('No wallet selected.');
            }

            // Firma automática antes de agregar el contacto
            const message = "Please sign this message to add a contact.";
            const signedData = await signMessage(selectedWallet, message);
            console.log("Signed data:", signedData); // Log de datos firmados

            await apiRequest('/api/contacts/add', {
                method: 'POST',
                body: JSON.stringify({
                    pubkey,
                    signature: signedData.signature,
                    message: signedData.message,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`, // Enviar el token JWT
                    'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') // Enviar el token CSRF
                },
            });

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
