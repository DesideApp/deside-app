import React, { useState } from 'react';
import { signMessage } from '../../utils/solanaHelpers';
import { apiRequest } from '../../services/apiService';

const AddContactForm = ({ onContactAdded }) => {
    const [pubkey, setPubkey] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const addContact = async () => {
        if (!pubkey) {
            setErrorMessage('Por favor, introduce una clave pública.');
            return;
        }

        try {
            const selectedWallet = localStorage.getItem('selectedWallet');
            if (!selectedWallet) {
                throw new Error('No wallet selected.');
            }

            const message = "Please sign this message to add a contact.";
            const signedData = await signMessage(selectedWallet, message);

            const body = {
                pubkey,
                signature: signedData.signature,
                message: signedData.message,
            };

            await apiRequest('/api/contacts/add', {
                method: 'POST',
                body: JSON.stringify(body),
            });

            alert('Contact request sent!');
            setPubkey('');
            setErrorMessage('');
            onContactAdded(); // Notifica al componente padre
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
