import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getBalance } from '../../utils/solanaHelpers.js';
import './ContactList.css';

const ContactList = () => {
    const [contacts, setContacts] = useState([]);
    const [newContact, setNewContact] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [contactBalance, setContactBalance] = useState(null);

    const handleAddContact = async () => {
        try {
            // Validar si es una clave pública válida
            const publicKey = new PublicKey(newContact);

            if (!contacts.includes(publicKey.toString())) {
                // Obtener balance de la wallet
                const balance = await getBalance(publicKey.toString());
                setContactBalance(balance);

                // Agregar el contacto a la lista
                setContacts([...contacts, publicKey.toString()]);
                setNewContact('');
                setErrorMessage('');
            } else {
                setErrorMessage('El contacto ya existe en la lista.');
            }
        } catch (e) {
            console.error(e);
            setErrorMessage(
                'Por favor, introduce una clave pública de Solana válida o verifica el balance.'
            );
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
            {contactBalance !== null && (
                <p className="balance-info">Balance: {contactBalance} SOL</p>
            )}

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
