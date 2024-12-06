import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import './ContactList.css';

const ContactList = () => {
    const [contacts, setContacts] = useState([]);
    const [newContact, setNewContact] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleAddContact = () => {
        try {
            new PublicKey(newContact);

            if (!contacts.includes(newContact)) {
                setContacts([...contacts, newContact]);
                setNewContact('');
                setErrorMessage('');
            } else {
                setErrorMessage('El contacto ya existe en la lista.');
            }
        } catch (e) {
            setErrorMessage('Por favor, introduce una clave pública de Solana válida.');
        }
    };

    const getSolanaFmLink = () => {
        if (newContact) {
            return `https://solana.fm/address/${newContact}`;
        }
        return '#';
    };

    return (
        <div className="contact-list-container">
            <h3>Mis Contactos</h3>

            {/* Contenedor para el botón de agregar contacto */}
            <div className="add-contact-button-container">
                <button onClick={handleAddContact} className="add-contact-button">Agregar Contacto</button>
            </div>

            {/* Contenedor para el input de la wallet y el icono de Solana FM */}
            <div className="wallet-input-container">
                <div className="input-wrapper">
                    <textarea
                        value={newContact}
                        onChange={(e) => setNewContact(e.target.value)}
                        placeholder="Clave pública de la wallet"
                        rows={1}
                        className="contact-input"
                    />
                    {newContact && (
                        <a
                            href={getSolanaFmLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="solana-fm-icon"
                        >
                            🔍
                        </a>
                    )}
                </div>
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
                                <button onClick={() => handleRemoveContact(contact)}>Eliminar</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ContactList;
