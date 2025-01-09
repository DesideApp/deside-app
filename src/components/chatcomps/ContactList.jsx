import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { apiRequest, addContact } from '../../services/apiService.js'; // Centralizar todas las llamadas a la API
import { signMessage } from '../../utils/solanaHelpers'; // Importar signMessage
import './ContactList.css';

const ContactList = () => {
    const [contacts, setContacts] = useState([]);
    const [newContact, setNewContact] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [pendingRequests, setPendingRequests] = useState([]);

    useEffect(() => {
        console.log('Fetching contacts...');
        const fetchContacts = async () => {
            try {
                const data = await apiRequest('/api/contacts'); // Usar apiService para obtener contactos
                console.log('Fetched contacts:', data);
                setContacts(data.contacts || []);
                setPendingRequests(data.pendingRequests || []);
            } catch (error) {
                console.error('Error fetching contacts:', error);
                setErrorMessage('Error al obtener contactos.');
            }
        };
        fetchContacts();
    }, []);

    const handleAddContact = async () => {
        if (!newContact) {
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

            // Llamada a la función addContact de apiService
            await addContact({
                pubkey: newContact,
                signature: signedData.signature,
                message: signedData.message,
            });

            alert('Contact request sent!');
            setNewContact('');
            setErrorMessage('');
        } catch (error) {
            console.error('Error sending contact request:', error);
            setErrorMessage('Error al enviar la solicitud de contacto.');
        }
    };

    const handleAcceptContact = async (pubkey) => {
        try {
            console.log('Accepting contact:', pubkey); // Log de aceptar contacto
            await apiRequest(`/api/contacts/accept`, {
                method: 'POST',
                body: JSON.stringify({ pubkey }),
            });
            setContacts((prev) => [...prev, pubkey]);
            setPendingRequests((prev) => prev.filter((req) => req !== pubkey));
        } catch (error) {
            console.error(error);
            setErrorMessage('Error al aceptar el contacto.');
        }
    };

    const handleRejectContact = async (pubkey) => {
        try {
            console.log('Rejecting contact:', pubkey); // Log de rechazar contacto
            await apiRequest(`/api/contacts/reject`, {
                method: 'POST',
                body: JSON.stringify({ pubkey }),
            });
            setPendingRequests((prev) => prev.filter((req) => req !== pubkey));
        } catch (error) {
            console.error(error);
            setErrorMessage('Error al rechazar el contacto.');
        }
    };

    const handleRemoveContact = (contact) => {
        console.log('Removing contact:', contact); // Log de eliminar contacto
        setContacts(contacts.filter((c) => c !== contact));
    };

    return (
        <div className="contact-list-container">
            <h3>Mis Contactos</h3>

            <div className="wallet-input-container">
                <textarea
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    placeholder="Clave pública de la wallet"
                    rows={1}
                    className="contact-input"
                />
                <button onClick={handleAddContact} className="add-contact-button">
                    Agregar Contacto
                </button>
            </div>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <div className="contacts-list-wrapper">
                {contacts.length === 0 ? (
                    <p className="no-contacts-message">No tienes contactos agregados.</p>
                ) : (
                    <ul className="contact-list">
                        {contacts.map((contact, index) => (
                            <li key={index} className="contact-item">
                                {contact}
                                <button onClick={() => handleRemoveContact(contact)}>
                                    Eliminar
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="pending-requests-wrapper">
                <h3>Solicitudes Pendientes</h3>
                {pendingRequests.length === 0 ? (
                    <p className="no-requests-message">No tienes solicitudes pendientes.</p>
                ) : (
                    <ul className="pending-requests-list">
                        {pendingRequests.map((request, index) => (
                            <li key={index} className="pending-request-item">
                                {request}
                                <button onClick={() => handleAcceptContact(request)}>
                                    Aceptar
                                </button>
                                <button onClick={() => handleRejectContact(request)}>
                                    Rechazar
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ContactList;
