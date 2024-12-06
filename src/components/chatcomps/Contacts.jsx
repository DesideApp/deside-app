import React, { useState } from 'react';
import './Contacts.css';

const Contacts = () => {
    const [contacts, setContacts] = useState([]);
    const [newContact, setNewContact] = useState('');

    // Función para manejar la adición de un nuevo contacto
    const handleAddContact = () => {
        if (newContact && !contacts.includes(newContact)) {
            setContacts([...contacts, newContact]);
            setNewContact(''); // Limpiar el campo de entrada
        }
    };

    // Función para eliminar un contacto existente
    const handleRemoveContact = (contact) => {
        setContacts(contacts.filter(c => c !== contact));
    };

    return (
        <div className="contacts-container">
            <h2>Mis Contactos</h2>
            <div className="add-contact">
                <input
                    type="text"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    placeholder="Clave pública de la wallet"
                />
                <button onClick={handleAddContact}>Agregar Contacto</button>
            </div>
            <ul className="contacts-list">
                {contacts.map((contact, index) => (
                    <li key={index} className="contact-item">
                        {contact}
                        <button onClick={() => handleRemoveContact(contact)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Contacts;