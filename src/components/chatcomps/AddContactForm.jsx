import React, { useState } from 'react';
import { signMessage } from '../../utils/solanaHelpers'; // Importar signMessage
import { addContact } from '../../services/contactService'; // Importar addContact

const AddContactForm = ({ onContactAdded }) => {
    const [pubkey, setPubkey] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleAddContact = async () => {
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

            await addContact({
                pubkey,
                signature: signedData.signature,
                message: signedData.message,
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
                id="pubkey"
                name="pubkey"
                value={pubkey}
                onChange={(e) => setPubkey(e.target.value)}
                placeholder="Enter public key"
            />
            <button onClick={handleAddContact}>Send Request</button>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
};

export default AddContactForm;
