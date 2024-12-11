import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import {
    getContacts,
    addContact,
    acceptContact,
    rejectContact,
} from '../../services/contactService.js';
import './ContactList.css';

const ContactList = () => {
    const [contacts, setContacts] = useState([]);
    const [newContact, setNewContact] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [pendingRequests, setPendingRequests] = useState([]);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const data = await getContacts();
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
            await addContact(publicKey.toString());
            setErrorMessage('');
            setNewContact('');
            alert('Solicitud enviada.');
        } catch (error) {
            console.error(error);
            setErrorMessage(error.message);
        }
    };

    const handleAcceptContact = async (pubkey) => {
        try {
            await acceptContact(pubkey);
            setContacts((prev) => [...prev, pubkey]);
            setPendingRequests((prev) => prev.filter((req) => req !== pubkey));
        } catch (error) {
            console.error(error);
            setErrorMessage(error.message);
        }
    };

    const handleRejectContact = async (pubkey) => {
        try {
            await rejectContact(pubkey);
            setPendingRequests((prev) => prev.filter((req) => req !== pubkey));
        } catch (error) {
            console.error(error);
            setErrorMessage(error.message);
        }
    };

    const handleRemoveContact = (contact) => {
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
