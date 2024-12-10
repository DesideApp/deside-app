import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getBalance } from '../../utils/solanaHelpers.js';
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

            if (!PublicKey.isOnCurve(publicKey.toBuffer())) {
                throw new Error('La clave pública no es válida.');
            }

            if (!contacts.includes(publicKey.toString())) {
                // Opcional: obtener balance para verificar que la wallet es válida
                try {
                    await getBalance(publicKey.toString()); // Verifica si la wallet es válida
                } catch (error) {
                    throw new Error('No se pudo verificar la clave pública. Asegúrate de que es válida.');
                }

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

    const getSolanaFmLink = () => {
        if (newContact) {
            return `https://solana.fm/address/${newContact}`;
        }
        return '#';
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
