import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import './ContactList.css';

const ContactList = () => {
    const [contacts, setContacts] = useState([]);
    const [newContact, setNewContact] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleAddContact = async () => {
        try {
            if (!newContact) {
                throw new Error('Por favor, introduce una clave pública.');
            }

            // Validar si es una clave pública válida
            const publicKey = new PublicKey(newContact);

            if (!contacts.includes(publicKey.toString())) {
                // Agregar el contacto a la lista
                setContacts([...contacts, publicKey.toString()]);
                setNewContact('');
                setErrorMessage('');
            } else {
                setErrorMessage('El contacto ya existe en la lista.');
            }
        } catch (e) {
            console.error(e);
            setErrorMessage(e.message || 'Error al agregar el contacto.');
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
        </div>
    );
};

export default ContactList;
