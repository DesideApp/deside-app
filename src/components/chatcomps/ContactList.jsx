import React, { useState } from "react";
import useContactManager from "../../hooks/useContactManager"; 
import "./ContactList.css";

function ContactList({ onSelectContact }) {
    const { 
        confirmedContacts, 
        pendingRequests, 
        receivedRequests, 
        handleAddContact, 
        handleAcceptRequest, 
        handleRejectRequest,
        handleRemoveContact 
    } = useContactManager();

    const [newContact, setNewContact] = useState("");
    const [view, setView] = useState("contacts"); 

    return (
        <div className="contact-list-container">
            <h3>📞 Contactos</h3>

            <div className="wallet-input-container">
                <input
                    type="text"
                    className="contact-input"
                    placeholder="Introduce wallet"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                />
                <button className="add-contact-button" onClick={() => handleAddContact(newContact)}>➕ Agregar</button>
            </div>

            {/* Selector de vista */}
            <div className="contact-tabs">
                <button onClick={() => setView("contacts")} className={view === "contacts" ? "active" : ""}>Contactos</button>
                <button onClick={() => setView("requests")} className={view === "requests" ? "active" : ""}>Solicitudes</button>
            </div>

            {view === "contacts" ? (
                <ul className="contact-list">
                    {confirmedContacts.length > 0 ? (
                        confirmedContacts.map((contact) => (
                            <li key={contact.wallet} className="contact-item">
                                <div className="contact-info" onClick={() => onSelectContact(contact.wallet)}>
                                    {contact.wallet.slice(0, 6)}...{contact.wallet.slice(-4)}
                                </div>
                                <button className="remove-contact-btn" onClick={() => handleRemoveContact(contact.wallet)}>❌</button>
                            </li>
                        ))
                    ) : (
                        <p className="no-contacts-message">No tienes contactos aún.</p>
                    )}
                </ul>
            ) : (
                <ul className="contact-list">
                    {receivedRequests.map((contact) => (
                        <li key={contact.wallet}>
                            {contact.wallet}
                            <button onClick={() => handleAcceptRequest(contact.wallet)}>✅ Aceptar</button>
                            <button onClick={() => handleRejectRequest(contact.wallet)}>❌ Rechazar</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ContactList;
