import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import './ContactList.css';

const ContactList = () => {
    const [contacts, setContacts] = useState([]); // Lista de contactos
    const [newContact, setNewContact] = useState(''); // Nueva clave pública
    const [errorMessage, setErrorMessage] = useState(''); // Mensajes de error
    const [pendingRequests, setPendingRequests] = useState([]); // Solicitudes pendientes

    // Cargar contactos y solicitudes pendientes desde el backend
    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contacts`)
            .then((response) => response.json())
            .then((data) => {
                setContacts(data.contacts || []);
                setPendingRequests(data.pendingRequests || []);
            })
            .catch((error) => console.error('Error fetching contacts:', error));
    }, []);

    const handleAddContact = async () => {
        try {
            if (!newContact) {
                throw new Error('Por favor, introduce una clave pública.');
            }

            // Validar si es una clave pública válida
            const publicKey = new PublicKey(newContact);

            // Enviar solicitud al backend
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contacts/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pubkey: publicKey.toString() }),
            });

            const result = await response.json();

            if (result.status === 'ok') {
                setErrorMessage('');
                setNewContact('');
                alert('Solicitud enviada.');
            } else {
                throw new Error(result.error || 'Error al enviar la solicitud.');
            }
        } catch (e) {
            console.error(e);
            setErrorMessage(e.message || 'Error al agregar el contacto.');
        }
    };

    const handleAcceptContact = async (pubkey) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contacts/accept`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pubkey }),
            });

            const result = await response.json();

            if (result.status === 'ok') {
                setContacts((prev) => [...prev, pubkey]);
                setPendingRequests((prev) => prev.filter((req) => req !== pubkey));
            } else {
                throw new Error(result.error || 'Error al aceptar el contacto.');
            }
        } catch (e) {
            console.error(e);
            setErrorMessage(e.message || 'Error al aceptar el contacto.');
        }
    };

    const handleRejectContact = async (pubkey) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contacts/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pubkey }),
            });

            const result = await response.json();

            if (result.status === 'ok') {
                setPendingRequests((prev) => prev.filter((req) => req !== pubkey));
            } else {
                throw new Error(result.error || 'Error al rechazar el contacto.');
            }
        } catch (e) {
            console.error(e);
            setErrorMessage(e.message || 'Error al rechazar el contacto.');
        }
    };

    const handleRemoveContact = (contact) => {
        setContacts(contacts.filter((c) => c !== contact));
    };

    return (
        <div className="contact-list-container">
            <h3>Mis Contactos</h3>

            {/* Contenedor para el input y botón de agregar contacto */}
            <div className="wallet-input-container">
                <div className="input-wrapper">
                    <textarea
                        value={newContact}
                        onChange={(e) => setNewContact(e.target.value)}
                        placeholder="Clave pública de la wallet"
                        rows={1}
                        className="contact-input"
                    />
                </div>
                <button
                    onClick={handleAddContact}
                    className="add-contact-button"
                >
                    Agregar Contacto
                </button>
            </div>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <div className="contacts-list-wrapper">
                {contacts.length === 0 ? (
                    <p className="no-contacts-message">
                        No tienes contactos agregados.
                    </p>
                ) : (
                    <ul className="contact-list">
                        {contacts.map((contact, index) => (
                            <li key={index} className="contact-item">
                                {contact}
                                <button
                                    onClick={() => handleRemoveContact(contact)}
                                >
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
                    <p className="no-requests-message">
                        No tienes solicitudes pendientes.
                    </p>
                ) : (
                    <ul className="pending-requests-list">
                        {pendingRequests.map((request, index) => (
                            <li key={index} className="pending-request-item">
                                {request}
                                <button
                                    onClick={() => handleAcceptContact(request)}
                                >
                                    Aceptar
                                </button>
                                <button
                                    onClick={() => handleRejectContact(request)}
                                >
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
