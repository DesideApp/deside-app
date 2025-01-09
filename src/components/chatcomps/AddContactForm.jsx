import React, { useState } from 'react';
import { signMessage } from '../../utils/solanaHelpers'; // Importar signMessage
import { addContact } from '../../services/contactService'; // Usar addContact optimizado
import './AddContactForm.css'; // Asegúrate de tener un archivo CSS para estilos

const AddContactForm = ({ onContactAdded }) => {
    const [pubkey, setPubkey] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Controlar el estado del botón

    const handleAddContact = async () => {
        if (!pubkey) {
            setErrorMessage('Por favor, introduce una clave pública.');
            return;
        }

        setErrorMessage('');
        setIsSubmitting(true); // Deshabilitar botón mientras se envía la solicitud

        try {
            const selectedWallet = localStorage.getItem('selectedWallet'); // Obtener la wallet seleccionada
            if (!selectedWallet) {
                throw new Error('No wallet selected.');
            }

            // Firma automática antes de agregar el contacto
            const message = "Please sign this message to add a contact.";
            const signedData = await signMessage(selectedWallet, message);

            console.log("Signed data:", signedData); // Log de datos firmados

            // Usar `addContact` del `apiService` para realizar la solicitud
            await addContact(pubkey, signedData.signature, signedData.message);

            alert('Contact request sent!');
            setPubkey('');
            onContactAdded(); // Notifica al componente padre que actualice los datos
        } catch (error) {
            console.error('Error sending contact request:', error);
            setErrorMessage(error.message || 'Error sending contact request.');
        } finally {
            setIsSubmitting(false); // Habilitar botón tras completar la solicitud
        }
    };

    return (
        <div className="add-contact-form">
            <h2>Add a Contact</h2>
            <input
                type="text"
                value={pubkey}
                onChange={(e) => setPubkey(e.target.value)}
                placeholder="Enter public key"
                className="add-contact-input"
            />
            <button
                onClick={handleAddContact}
                disabled={isSubmitting}
                className="add-contact-button"
            >
                {isSubmitting ? 'Sending...' : 'Send Request'}
            </button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
};

export default AddContactForm;
