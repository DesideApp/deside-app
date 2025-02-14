import React, { useState } from "react";
import useContactManager from "../../hooks/useContactManager"; // ✅ Nuevo hook
import "./ContactList.css";

function ContactList({ onSelectContact }) {
    const { 
        confirmedContacts, 
        pendingRequests, 
        receivedRequests, 
        handleAddContact, 
        handleAcceptRequest, 
        handleRejectRequest,
        handleRemoveContact // ✅ Nuevo
    } = useContactManager();

    const [newContact, setNewContact] = useState("");

    return (
        <div className="contact-list-container">
            <h3>Contacts</h3>

            {/* 🔵 Input para agregar un nuevo contacto */}
            <div className="wallet-input-container">
                <input
                    type="text"
                    className="contact-input"
                    placeholder="Enter wallet address"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                />
                <button className="add-contact-button" onClick={() => handleAddContact(newContact)}>➕ Add Contact</button>
            </div>

            {/* 🔵 Lista de contactos confirmados */}
            <h3>Confirmed Contacts</h3>
            <ul className="contact-list">
                {confirmedContacts.length > 0 ? (
                    confirmedContacts.map((contact) => (
                        <li key={contact.wallet} className="contact-item">
                            <div className="contact-info" onClick={() => onSelectContact(contact.wallet)}>
                                <span className="contact-name">
                                    {contact.wallet.slice(0, 6)}...{contact.wallet.slice(-4)}
                                </span>
                            </div>
                            <button className="remove-contact-btn" onClick={() => handleRemoveContact(contact.wallet)}>❌</button>
                        </li>
                    ))
                ) : (
                    <p>No confirmed contacts.</p>
                )}
            </ul>

            {/* 🔵 Lista de solicitudes recibidas */}
            <h3>Incoming Requests</h3>
            <ul className="contact-list">
                {receivedRequests.map((contact) => (
                    <li key={contact.wallet}>
                        {contact.wallet}
                        <button onClick={() => handleAcceptRequest(contact.wallet)}>✅ Accept</button>
                        <button onClick={() => handleRejectRequest(contact.wallet)}>❌ Reject</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ContactList;
