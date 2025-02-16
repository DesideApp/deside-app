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
        handleRejectRequest 
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
                <button className="requests-button" onClick={() => setView(view === "contacts" ? "requests" : "contacts")}>
                    {view === "contacts" ? "📩 Solicitudes" : "⬅️ Volver"}
                </button>
            </div>

            {view === "contacts" ? (
                <ul className="contact-list">
                    {confirmedContacts.length > 0 ? (
                        confirmedContacts.map((contact) => (
                            <li key={contact.wallet} className="contact-item" onClick={() => onSelectContact(contact.wallet)}>
                                {contact.wallet.slice(0, 6)}...{contact.wallet.slice(-4)}
                            </li>
                        ))
                    ) : (
                        <p className="no-contacts-message">Aún no tienes contactos.</p>
                    )}
                </ul>
            ) : (
                <div>
                    <div className="request-tabs">
                        <button className="request-tab active">📥 Recibidas ({receivedRequests.length})</button>
                        <button className="request-tab">📤 Enviadas ({pendingRequests.length})</button>
                    </div>
                    <div className="requests-container">
                        <ul className="contact-list">
                            {receivedRequests.map((contact) => (
                                <li key={contact.wallet}>
                                    {contact.wallet}
                                    <button className="accept-btn" onClick={() => handleAcceptRequest(contact.wallet)}>✅</button>
                                    <button className="reject-btn" onClick={() => handleRejectRequest(contact.wallet)}>❌</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ContactList;
