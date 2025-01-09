import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { apiRequest } from '../../services/apiService';
import { signMessage } from '../../utils/solanaHelpers';
import './ContactList.css';

const ContactList = () => {
    const [contacts, setContacts] = useState([]);
    const [newContact, setNewContact] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [pendingRequests, setPendingRequests] = useState([]);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const data = await apiRequest('/api/contacts');
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
            const publicKey = new PublicKey(newContact);
            const message = "Please sign this message to add a contact.";
            const signedData = await signMessage('phantom', message);

            const body = {
                pubkey: publicKey.toString(),
                signature: signedData.signature,
                message: signedData.message,
            };

            await apiRequest('/api/contacts/add', {
                method: 'POST',
                body: JSON.stringify(body),
            });

            alert('Solicitud enviada.');
            setErrorMessage('');
            setNewContact('');
        } catch (error) {
            console.error('Error sending contact request:', error);
            setErrorMessage('Error sending contact request.');
        }
    };

    const handleAcceptContact = async (pubkey) => {
        try {
            await apiRequest(`/api/contacts/accept`, {
                method: 'POST',
                body: JSON.stringify({ pubkey }),
            });
            setContacts((prev) => [...prev, pubkey]);
            setPendingRequests((prev) => prev.filter((req) => req !== pubkey));
        } catch (error) {
            console.error('Error accepting contact:', error);
            setErrorMessage('Error accepting contact.');
        }
    };

    const handleRejectContact = async (pubkey) => {
        try {
            await apiRequest(`/api/contacts/reject`, {
                method: 'POST',
                body: JSON.stringify({ pubkey }),
            });
            setPendingRequests((prev) => prev.filter((req) => req !== pubkey));
        } catch (error) {
            console.error('Error rejecting contact:', error);
            setErrorMessage('Error rejecting contact.');
        }
    };

    const handleRemoveContact = (contact) => {
        setContacts((prev) => prev.filter((c) => c !== contact));
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
